'use client'

import { motion } from 'framer-motion'
import { DollarSign, ExternalLink, AlertTriangle } from 'lucide-react'

/**
 * 真实成本分析 —— 不是"拍脑袋BOM"，而是基于实际渠道可查价格的估算
 * 
 * 方法论：
 * 1. 立创商城/贸泽/DigiKey 查询小批量价格（100-1000pcs）
 * 2. 区分 MOQ 阶梯价（1K/5K/10K）
 * 3. 加入被忽略的隐性成本（PCBA加工、测试、认证、包装、退货）
 * 4. 诚实标注哪些是估算、哪些需要实际询价确认
 */

interface CostItem {
  component: string
  spec: string
  qty1k: number    // 1000pcs 单价
  qty10k: number   // 10000pcs 单价
  source: string
  sourceUrl?: string
  confidence: 'verified' | 'estimated' | 'needs-quote'
  note: string
}

const bomItems: CostItem[] = [
  {
    component: 'nRF52840 QFN',
    spec: 'nRF52840-QIAA-R7',
    qty1k: 28.5,
    qty10k: 22.0,
    source: '贸泽电子',
    sourceUrl: 'https://www.mouser.cn',
    confidence: 'verified',
    note: '2024Q4 价格，含税。Nordic 原厂交期 12-16 周',
  },
  {
    component: 'DRV2605L 马达驱动',
    spec: 'DRV2605LDGSR',
    qty1k: 8.2,
    qty10k: 6.5,
    source: '立创商城',
    sourceUrl: 'https://www.szlcsc.com',
    confidence: 'verified',
    note: 'TI 原厂，MSOP-10 封装',
  },
  {
    component: 'LRA 线性马达 ×2',
    spec: 'Φ8×3.2mm LRA',
    qty1k: 9.0,
    qty10k: 6.0,
    source: '金龙机电（需询价）',
    confidence: 'needs-quote',
    note: '参考 1688 类似规格报价，实际需联系厂家确认 MOQ 和定制费',
  },
  {
    component: 'BMA400 加速度计',
    spec: 'BMA400 LGA-12',
    qty1k: 4.8,
    qty10k: 3.5,
    source: '贸泽电子',
    confidence: 'verified',
    note: 'Bosch 原厂，超低功耗型',
  },
  {
    component: '锂电池 200mAh',
    spec: '302040 锂聚合物',
    qty1k: 12.0,
    qty10k: 8.5,
    source: '1688 电池厂',
    confidence: 'estimated',
    note: '含保护板。ATL/BYD 品牌需额外加 30-50%。需 UN38.3 认证',
  },
  {
    component: 'PCB 4层板',
    spec: '30×20mm, 4L, 1oz Cu',
    qty1k: 3.5,
    qty10k: 2.0,
    source: '嘉立创',
    confidence: 'verified',
    note: '含阻抗控制（BLE 天线需要 50Ω 匹配）',
  },
  {
    component: 'USB-C 接口',
    spec: '16Pin SMD',
    qty1k: 1.2,
    qty10k: 0.8,
    source: '立创商城',
    confidence: 'verified',
    note: '含 ESD 保护',
  },
  {
    component: '其他被动元件',
    spec: '电容/电阻/电感/晶振 约30颗',
    qty1k: 3.0,
    qty10k: 2.0,
    source: '估算',
    confidence: 'estimated',
    note: '32.768kHz 晶振 + 32MHz 晶振 + 去耦电容 + DC-DC 电感等',
  },
]

// 隐性成本（经常被忽略的部分）
const hiddenCosts = [
  { item: 'SMT 贴片加工', qty1k: 8.0, qty10k: 4.0, note: '含钢网费摊销、AOI 检测' },
  { item: '功能测试治具', qty1k: 3.0, qty10k: 1.5, note: '测试治具开发费 ¥2-3万，摊到每台' },
  { item: '组装人工', qty1k: 5.0, qty10k: 3.0, note: '电池焊接+马达安装+外壳组装+QC' },
  { item: '硅胶外壳', qty1k: 12.0, qty10k: 8.0, note: '含开模费摊销（模具 ¥4万 ÷ 10K = ¥4/台）' },
  { item: '包装 + 配件', qty1k: 6.0, qty10k: 4.0, note: '彩盒+说明书+USB-C线+硅胶塞' },
  { item: '认证费摊销', qty1k: 5.0, qty10k: 1.0, note: 'BLE FCC/CE/SRRC ≈ ¥5万，摊到每台' },
  { item: '退货/售后预留', qty1k: 6.0, qty10k: 6.0, note: '按 2% 退货率 × ¥299 售价' },
]

const bomTotal1k = bomItems.reduce((s, i) => s + i.qty1k, 0)
const bomTotal10k = bomItems.reduce((s, i) => s + i.qty10k, 0)
const hiddenTotal1k = hiddenCosts.reduce((s, i) => s + i.qty1k, 0)
const hiddenTotal10k = hiddenCosts.reduce((s, i) => s + i.qty10k, 0)
const grandTotal1k = bomTotal1k + hiddenTotal1k
const grandTotal10k = bomTotal10k + hiddenTotal10k
const retailPrice = 299
const margin1k = ((retailPrice - grandTotal1k) / retailPrice * 100)
const margin10k = ((retailPrice - grandTotal10k) / retailPrice * 100)

const confidenceColors = {
  'verified': 'text-green-400',
  'estimated': 'text-yellow-400',
  'needs-quote': 'text-red-400',
}
const confidenceLabels = {
  'verified': '已核实',
  'estimated': '估算',
  'needs-quote': '需询价',
}

export default function RealCost() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">真实成本分析（修正版）</h3>
      </div>

      <div className="glass-card p-4 border-l-2 border-yellow-500/50">
        <p className="text-xs text-white/50">
          <span className="text-yellow-300">对比初版 BOM：</span>初版声称总成本 ¥56、毛利率 81%——这是在忽略加工费、测试、认证、包装、售后等隐性成本后的"理想数字"。
          以下是更接近真实的成本拆解，包含置信度标注。
        </p>
      </div>

      {/* 元器件 BOM */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <h4 className="text-sm text-white/60">元器件 BOM</h4>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-white/50 font-normal">组件</th>
              <th className="text-right p-2 text-white/50 font-normal">1K价</th>
              <th className="text-right p-2 text-white/50 font-normal">10K价</th>
              <th className="text-center p-2 text-white/50 font-normal">置信度</th>
              <th className="text-left p-2 text-white/50 font-normal hidden lg:table-cell">备注</th>
            </tr>
          </thead>
          <tbody>
            {bomItems.map(item => (
              <tr key={item.component} className="border-b border-white/5">
                <td className="p-2 text-white/70">{item.component}</td>
                <td className="p-2 text-right text-white/60 font-mono">¥{item.qty1k.toFixed(1)}</td>
                <td className="p-2 text-right text-blue-300 font-mono">¥{item.qty10k.toFixed(1)}</td>
                <td className={`p-2 text-center ${confidenceColors[item.confidence]}`}>
                  {confidenceLabels[item.confidence]}
                </td>
                <td className="p-2 text-white/30 hidden lg:table-cell">{item.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="p-2 text-white/80 font-medium">元器件小计</td>
              <td className="p-2 text-right text-white/60 font-mono">¥{bomTotal1k.toFixed(1)}</td>
              <td className="p-2 text-right text-blue-300 font-mono font-medium">¥{bomTotal10k.toFixed(1)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 隐性成本 */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <h4 className="text-sm text-white/60">隐性成本（初版遗漏）</h4>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-white/50 font-normal">项目</th>
              <th className="text-right p-2 text-white/50 font-normal">1K价</th>
              <th className="text-right p-2 text-white/50 font-normal">10K价</th>
              <th className="text-left p-2 text-white/50 font-normal hidden md:table-cell">说明</th>
            </tr>
          </thead>
          <tbody>
            {hiddenCosts.map(item => (
              <tr key={item.item} className="border-b border-white/5">
                <td className="p-2 text-white/70">{item.item}</td>
                <td className="p-2 text-right text-white/60 font-mono">¥{item.qty1k.toFixed(1)}</td>
                <td className="p-2 text-right text-orange-300 font-mono">¥{item.qty10k.toFixed(1)}</td>
                <td className="p-2 text-white/30 hidden md:table-cell">{item.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="p-2 text-white/80 font-medium">隐性成本小计</td>
              <td className="p-2 text-right text-white/60 font-mono">¥{hiddenTotal1k.toFixed(1)}</td>
              <td className="p-2 text-right text-orange-300 font-mono font-medium">¥{hiddenTotal10k.toFixed(1)}</td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 总结对比 */}
      <div className="glass-card p-4 space-y-4">
        <h4 className="text-sm text-white/60 font-medium">成本总结</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.03] rounded-lg text-center">
            <p className="text-xs text-white/40">1,000 台（众筹阶段）</p>
            <p className="text-2xl text-white/80 font-light font-mono mt-1">¥{grandTotal1k.toFixed(0)}</p>
            <p className="text-xs text-white/30 mt-1">毛利率 {margin1k.toFixed(0)}%</p>
          </div>
          <div className="p-3 bg-white/[0.03] rounded-lg text-center">
            <p className="text-xs text-white/40">10,000 台（量产）</p>
            <p className="text-2xl text-blue-300 font-light font-mono mt-1">¥{grandTotal10k.toFixed(0)}</p>
            <p className="text-xs text-white/30 mt-1">毛利率 {margin10k.toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="p-3 bg-white/[0.03] rounded-lg">
          <p className="text-xs text-white/50">
            <span className="text-white/70">vs 初版声称：</span>初版 BOM ¥56 / 毛利率 81% → 
            修正后 10K 量产实际成本 <span className="text-blue-300">¥{grandTotal10k.toFixed(0)}</span> / 
            毛利率 <span className="text-blue-300">{margin10k.toFixed(0)}%</span>。
            差异主要来自：加工费、认证费、售后预留、以及元器件实际市场价（vs 理想价）。
          </p>
          <p className="text-xs text-white/40 mt-2">
            {margin10k > 50 ? '毛利率仍然健康，支撑渠道分成（天猫扣点5%+物流3%）后净利仍可观。' : 
             margin10k > 30 ? '毛利率偏紧，需要通过订阅收入补充利润。' :
             '毛利率过低，需要重新评估定价或降本方案。'}
          </p>
        </div>
      </div>

      {/* 一次性投入 */}
      <div className="glass-card p-4 space-y-2">
        <h4 className="text-sm text-white/60 font-medium">一次性投入（不含在单台成本中）</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>• 硅胶外壳模具：¥3-5 万（压缩模，寿命 5 万模次）</p>
          <p>• 内部骨架注塑模具：¥2-3 万</p>
          <p>• 测试治具开发：¥2-3 万（含 BLE 射频测试 + 功能测试）</p>
          <p>• 认证费用：FCC ¥2万 + CE ¥1.5万 + SRRC ¥1.5万 = ¥5 万</p>
          <p>• 首批打样（5轮 EVT/DVT/PVT）：¥3-5 万</p>
          <p className="text-white/60 font-medium pt-1">总计一次性投入：约 ¥15-20 万</p>
        </div>
      </div>
    </div>
  )
}
