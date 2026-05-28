'use client'

import { motion } from 'framer-motion'
import { DollarSign, ExternalLink, AlertTriangle, TrendingDown } from 'lucide-react'

/**
 * 真实成本分析 v3 —— 补充渠道费、良率损耗、库存资金、退货率等"成本盲区"
 * 
 * v3 修正点：
 * 1. 退货率从 2% 修正为 5-8%（消费电子实际水平）
 * 2. 新增渠道费用：天猫扣点 5% + 推广费 10-15%
 * 3. 新增良率损耗：SMT 良率 98% + 组装良率 95% = 综合 93%
 * 4. 新增库存资金占用成本
 * 5. 从"毛利率"视角转向"净利率"视角
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

// 制造隐性成本
const hiddenCosts = [
  { item: 'SMT 贴片加工', qty1k: 8.0, qty10k: 4.0, note: '含钢网费摊销、AOI 检测' },
  { item: '功能测试治具', qty1k: 3.0, qty10k: 1.5, note: '测试治具开发费 ¥2-3万，摊到每台' },
  { item: '组装人工', qty1k: 5.0, qty10k: 3.0, note: '电池焊接+马达安装+外壳组装+QC' },
  { item: '硅胶外壳', qty1k: 12.0, qty10k: 8.0, note: '含开模费摊销（模具 ¥4万 ÷ 10K = ¥4/台）' },
  { item: '包装 + 配件', qty1k: 6.0, qty10k: 4.0, note: '彩盒+说明书+USB-C线+硅胶塞' },
  { item: '认证费摊销', qty1k: 5.0, qty10k: 1.0, note: 'BLE FCC/CE/SRRC ≈ ¥5万，摊到每台' },
]

// v3 新增：渠道 & 运营成本（之前完全遗漏的"成本盲区"）
const channelCosts = [
  { item: '天猫平台扣点', rate: '5%', perUnit1k: 14.95, perUnit10k: 14.95, note: '天猫技术服务费 5%（消费电子类目），按 ¥299 售价计算' },
  { item: '推广/获客费用', rate: '10-15%', perUnit1k: 37.4, perUnit10k: 29.9, note: '直通车+超推+达人佣金。新品期 15%，稳定期 10%。行业均值 12%' },
  { item: '物流仓储', rate: '3%', perUnit1k: 9.0, perUnit10k: 7.0, note: '顺丰/京东物流 ¥6-8/单 + 仓储 ¥1-2/月/SKU' },
  { item: '退货损耗', rate: '5-8%', perUnit1k: 17.9, perUnit10k: 14.9, note: '消费电子退货率 5-8%（非 2%！）。退货品翻新成本 ¥15/台 + 运费损失' },
  { item: '良率损耗', rate: '~7%', perUnit1k: 7.5, perUnit10k: 5.0, note: 'SMT 良率 98% × 组装良率 95% = 综合 93%。不良品成本摊入良品' },
  { item: '库存资金占用', rate: '~3%', perUnit1k: 4.0, perUnit10k: 3.0, note: '备货周期 60-90 天 × 年化资金成本 8-12%。首批备货 ¥50-100万' },
]

const bomTotal1k = bomItems.reduce((s, i) => s + i.qty1k, 0)
const bomTotal10k = bomItems.reduce((s, i) => s + i.qty10k, 0)
const hiddenTotal1k = hiddenCosts.reduce((s, i) => s + i.qty1k, 0)
const hiddenTotal10k = hiddenCosts.reduce((s, i) => s + i.qty10k, 0)
const channelTotal1k = channelCosts.reduce((s, i) => s + i.perUnit1k, 0)
const channelTotal10k = channelCosts.reduce((s, i) => s + i.perUnit10k, 0)

const manufacturingCost1k = bomTotal1k + hiddenTotal1k
const manufacturingCost10k = bomTotal10k + hiddenTotal10k
const totalCost1k = manufacturingCost1k + channelTotal1k
const totalCost10k = manufacturingCost10k + channelTotal10k

const retailPrice = 299
const grossMargin1k = ((retailPrice - manufacturingCost1k) / retailPrice * 100)
const grossMargin10k = ((retailPrice - manufacturingCost10k) / retailPrice * 100)
const netMargin1k = ((retailPrice - totalCost1k) / retailPrice * 100)
const netMargin10k = ((retailPrice - totalCost10k) / retailPrice * 100)

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
        <h3 className="text-lg text-white/90 font-medium">真实成本分析 v3（含渠道盲区）</h3>
      </div>

      {/* v3 修正说明 */}
      <div className="glass-card p-4 border-l-2 border-red-500/50 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h4 className="text-sm text-red-300/80">v3 成本盲区修正</h4>
        </div>
        <div className="text-xs text-white/40 space-y-1">
          <p><span className="text-white/60">v2 遗漏了什么：</span>只算了"造出来多少钱"，没算"卖出去多少钱"。一个硬件产品的真实成本 = 制造成本 + 渠道成本 + 运营损耗。</p>
          <p><span className="text-white/60">退货率修正：</span>v2 假设 2% 退货率——这是成熟品牌的水平。新品牌消费电子实际退货率 5-8%（数据来源：天猫消费电子类目均值）。</p>
          <p><span className="text-white/60">渠道费修正：</span>天猫扣点 5% + 推广费 10-15% + 物流 3% = 渠道综合费率 18-23%。这意味着每卖 ¥299，平台和推广要拿走 ¥55-70。</p>
        </div>
      </div>

      {/* 元器件 BOM */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <h4 className="text-sm text-white/60">① 元器件 BOM</h4>
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

      {/* 制造隐性成本 */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <h4 className="text-sm text-white/60">② 制造隐性成本</h4>
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
              <td className="p-2 text-white/80 font-medium">制造隐性小计</td>
              <td className="p-2 text-right text-white/60 font-mono">¥{hiddenTotal1k.toFixed(1)}</td>
              <td className="p-2 text-right text-orange-300 font-mono font-medium">¥{hiddenTotal10k.toFixed(1)}</td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* v3 新增：渠道 & 运营成本 */}
      <div className="glass-card overflow-hidden border border-red-500/20">
        <div className="p-3 border-b border-white/5 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h4 className="text-sm text-red-300/80">③ 渠道 & 运营成本（v3 新增 — 之前的盲区）</h4>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-white/50 font-normal">项目</th>
              <th className="text-center p-2 text-white/50 font-normal">费率</th>
              <th className="text-right p-2 text-white/50 font-normal">1K/台</th>
              <th className="text-right p-2 text-white/50 font-normal">10K/台</th>
              <th className="text-left p-2 text-white/50 font-normal hidden md:table-cell">说明</th>
            </tr>
          </thead>
          <tbody>
            {channelCosts.map(item => (
              <tr key={item.item} className="border-b border-white/5">
                <td className="p-2 text-white/70">{item.item}</td>
                <td className="p-2 text-center text-red-300/70 font-mono">{item.rate}</td>
                <td className="p-2 text-right text-white/60 font-mono">¥{item.perUnit1k.toFixed(1)}</td>
                <td className="p-2 text-right text-red-300 font-mono">¥{item.perUnit10k.toFixed(1)}</td>
                <td className="p-2 text-white/30 hidden md:table-cell">{item.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="p-2 text-white/80 font-medium">渠道运营小计</td>
              <td className="p-2"></td>
              <td className="p-2 text-right text-white/60 font-mono">¥{channelTotal1k.toFixed(1)}</td>
              <td className="p-2 text-right text-red-300 font-mono font-medium">¥{channelTotal10k.toFixed(1)}</td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 总结对比 —— 毛利 vs 净利 */}
      <div className="glass-card p-4 space-y-4">
        <h4 className="text-sm text-white/60 font-medium">成本全景（毛利 vs 净利）</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.03] rounded-lg text-center space-y-3">
            <p className="text-xs text-white/40">1,000 台（众筹阶段）</p>
            <div>
              <p className="text-xs text-white/30">制造成本</p>
              <p className="text-lg text-white/70 font-mono">¥{manufacturingCost1k.toFixed(0)}</p>
              <p className="text-xs text-white/30">毛利率 {grossMargin1k.toFixed(0)}%</p>
            </div>
            <div className="border-t border-white/10 pt-2">
              <p className="text-xs text-white/30">全成本（含渠道）</p>
              <p className="text-lg text-red-300 font-mono">¥{totalCost1k.toFixed(0)}</p>
              <p className="text-xs text-red-300/70">净利率 {netMargin1k.toFixed(0)}%</p>
            </div>
          </div>
          <div className="p-3 bg-white/[0.03] rounded-lg text-center space-y-3">
            <p className="text-xs text-white/40">10,000 台（量产）</p>
            <div>
              <p className="text-xs text-white/30">制造成本</p>
              <p className="text-lg text-blue-300 font-mono">¥{manufacturingCost10k.toFixed(0)}</p>
              <p className="text-xs text-white/30">毛利率 {grossMargin10k.toFixed(0)}%</p>
            </div>
            <div className="border-t border-white/10 pt-2">
              <p className="text-xs text-white/30">全成本（含渠道）</p>
              <p className="text-lg text-red-300 font-mono">¥{totalCost10k.toFixed(0)}</p>
              <p className="text-xs text-red-300/70">净利率 {netMargin10k.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white/[0.03] rounded-lg space-y-2">
          <p className="text-xs text-white/50">
            <span className="text-white/70">关键洞察：</span>制造毛利率 {grossMargin10k.toFixed(0)}% 看起来健康，
            但加上渠道费后净利率降至 <span className="text-red-300">{netMargin10k.toFixed(0)}%</span>。
            这意味着：
          </p>
          <div className="text-xs text-white/40 space-y-1 pl-2">
            <p>• 纯硬件销售的利润空间有限 → 必须靠订阅收入（App 会员 ¥9.9/月）补充</p>
            <p>• 推广费是最大变量 → 初期可通过 KOL 种草 + 小红书内容营销降低到 8%</p>
            <p>• 退货率控制是关键 → 需要优化开箱体验 + 7天内推送使用引导降低退货</p>
            <p>• 众筹阶段（1K台）几乎不赚钱 → 目的是验证需求，不是盈利</p>
          </div>
        </div>
      </div>

      {/* 盈亏平衡分析 —— v4: 增加 500 台众筹场景 */}
      <div className="glass-card p-4 space-y-4">
        <h4 className="text-sm text-white/60 font-medium">盈亏平衡分析（含众筹场景）</h4>
        
        {/* 众筹 500 台场景 */}
        <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/10 space-y-2">
          <p className="text-xs text-orange-300/80 font-medium">场景 A：众筹 500 台（最小验证批次）</p>
          <div className="text-xs text-white/40 space-y-1">
            <p><span className="text-white/60">一次性投入（精简版）：</span>3D打印模具 ¥2万 + 简化认证 ¥3万 + 治具 ¥2万 + 打样 ¥3万 = <span className="text-white/60">¥10万</span></p>
            <p><span className="text-white/60">单台制造成本（500台）：</span>BOM ¥{(bomTotal1k * 1.1).toFixed(0)} + 制造 ¥{(hiddenTotal1k * 1.2).toFixed(0)} = <span className="text-white/60">¥{((bomTotal1k * 1.1) + (hiddenTotal1k * 1.2)).toFixed(0)}/台</span>（小批量溢价 10-20%）</p>
            <p><span className="text-white/60">众筹定价：</span>早鸟 ¥249 / 正常 ¥279（众筹平台扣点 5-8%）</p>
            <p><span className="text-white/60">单台净利（众筹）：</span>¥249 - ¥{((bomTotal1k * 1.1) + (hiddenTotal1k * 1.2)).toFixed(0)} - 平台扣点¥17 ≈ <span className={`${249 - (bomTotal1k * 1.1) - (hiddenTotal1k * 1.2) - 17 > 0 ? 'text-green-300' : 'text-red-300'}`}>¥{(249 - (bomTotal1k * 1.1) - (hiddenTotal1k * 1.2) - 17).toFixed(0)}/台</span></p>
            <p><span className="text-white/60">500 台总利润：</span>¥{((249 - (bomTotal1k * 1.1) - (hiddenTotal1k * 1.2) - 17) * 500).toFixed(0)} — 一次性投入 ¥100,000 = <span className="text-red-300">亏损 ¥{(100000 - (249 - (bomTotal1k * 1.1) - (hiddenTotal1k * 1.2) - 17) * 500).toFixed(0)}</span></p>
            <p className="text-white/50 pt-1 border-t border-white/5"><span className="text-orange-300">结论：</span>500 台众筹不是为了赚钱，是为了验证需求 + 收集用户反馈 + 积累口碑。亏损 ¥5-8 万是"学费"。</p>
          </div>
        </div>

        {/* 1000 台场景 */}
        <div className="p-3 bg-white/[0.03] rounded-lg space-y-2">
          <p className="text-xs text-white/60 font-medium">场景 B：首批量产 1,000 台</p>
          <div className="text-xs text-white/40 space-y-1">
            <p><span className="text-white/60">一次性投入：</span>模具 ¥7万 + 认证 ¥5万 + 治具 ¥3万 + 打样 ¥5万 = <span className="text-white/60">¥20万</span></p>
            <p><span className="text-white/60">单台净利：</span>¥299 × {netMargin1k.toFixed(0)}% = <span className="text-white/60">¥{(retailPrice * netMargin1k / 100).toFixed(0)}/台</span></p>
            <p><span className="text-white/60">盈亏平衡：</span>200,000 ÷ {(retailPrice * netMargin1k / 100).toFixed(0)} ≈ <span className="text-blue-300">{Math.ceil(200000 / (retailPrice * netMargin1k / 100))} 台</span>（{netMargin1k > 0 ? '可在首批内回本' : '首批无法回本'}）</p>
          </div>
        </div>

        {/* 10000 台场景 */}
        <div className="p-3 bg-white/[0.03] rounded-lg space-y-2">
          <p className="text-xs text-white/60 font-medium">场景 C：规模量产 10,000 台</p>
          <div className="text-xs text-white/40 space-y-1">
            <p><span className="text-white/60">单台净利：</span>¥299 × {netMargin10k.toFixed(0)}% = <span className="text-white/60">¥{(retailPrice * netMargin10k / 100).toFixed(0)}/台</span></p>
            <p><span className="text-white/60">加上订阅收入：</span>假设 30% 用户订阅 ¥9.9/月，LTV 6个月 → 额外 ¥17.8/台</p>
            <p><span className="text-white/60">综合单台利润：</span>¥{(retailPrice * netMargin10k / 100 + 17.8).toFixed(0)}/台 → 10K 台总利润 <span className="text-green-300">¥{((retailPrice * netMargin10k / 100 + 17.8) * 10000 / 10000).toFixed(0)}万</span></p>
          </div>
        </div>

        <div className="p-3 bg-white/[0.03] rounded-lg">
          <p className="text-xs text-white/50">
            <span className="text-white/70">关键决策点：</span>众筹 500 台的目的不是盈利，而是用 ¥10 万投入换取：
            ① 500 个真实用户的使用数据和反馈；
            ② 验证"触觉引导呼吸"的核心假设；
            ③ 积累产品口碑和种子用户社群。
            如果 500 台众筹都卖不出去，说明需求不存在，及时止损。
          </p>
        </div>
      </div>

      {/* 一次性投入 */}
      <div className="glass-card p-4 space-y-2">
        <h4 className="text-sm text-white/60 font-medium">一次性投入明细</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>• 硅胶外壳模具：¥3-5 万（压缩模，寿命 5 万模次）</p>
          <p>• 内部骨架注塑模具：¥2-3 万</p>
          <p>• 测试治具开发：¥2-3 万（含 BLE 射频测试 + 功能测试）</p>
          <p>• 认证费用：FCC ¥2万 + CE ¥1.5万 + SRRC ¥1.5万 = ¥5 万</p>
          <p>• 首批打样（5轮 EVT/DVT/PVT）：¥3-5 万</p>
          <p className="text-white/60 font-medium pt-1">总计一次性投入：约 ¥15-20 万</p>
        </div>
      </div>

      {/* 诚实声明 */}
      <div className="glass-card p-4 border-l-2 border-red-500/30 space-y-2">
        <h4 className="text-sm text-red-300/80">诚实声明</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>以上成本分析基于公开渠道价格查询 + 行业经验估算，<span className="text-white/60">未经实际询价和打样验证</span>。</p>
          <p>可能的偏差来源：</p>
          <p className="pl-4">• 推广费率高度依赖品类竞争程度（呼吸设备是蓝海，可能低于 10%）</p>
          <p className="pl-4">• 退货率取决于产品体验质量（如果触觉反馈做得好，可能低于 5%）</p>
          <p className="pl-4">• 良率在 PVT 阶段后通常能提升到 97%+</p>
          <p className="pl-4">• 未计入团队人力成本（假设创始人不拿工资的早期阶段）</p>
        </div>
      </div>
    </div>
  )
}
