'use client'

import { motion } from 'framer-motion'
import { Box, AlertTriangle } from 'lucide-react'

/**
 * 机械堆叠布局可行性分析
 * 
 * 核心问题：60×45×25mm 的体积里，能不能塞下所有元器件？
 * 这不是画个外观图就完事的——需要考虑：
 * 1. BLE 天线净空区（周围 5mm 无金属/电池）
 * 2. 电池体积（200mAh 锂聚合物的实际尺寸）
 * 3. 马达安装位置（振动传导路径）
 * 4. 散热（马达工作时的温升）
 * 5. 充电接口位置（用户使用姿势）
 */

const volumeBudget = {
  total: { l: 60, w: 45, h: 25, vol: 60 * 45 * 25 * 0.001 }, // cm³，椭球体约占长方体的 52%
  effectiveVol: 60 * 45 * 25 * 0.001 * 0.52, // 鹅卵石形态有效体积
  components: [
    { name: 'PCB (4层, 含nRF52840+DRV2605L)', l: 30, w: 20, h: 1.6, vol: 0.96, note: '主板，居中放置' },
    { name: 'LRA 马达 ×2', l: 8, w: 8, h: 3.2, vol: 0.32, note: 'Φ8×3.2mm 纽扣型，对称放置于PCB两侧' },
    { name: '锂电池 200mAh', l: 30, w: 20, h: 4, vol: 2.4, note: '实际尺寸参考 ATL 302040 型号' },
    { name: 'BLE 天线净空区', l: 15, w: 10, h: 25, vol: 3.75, note: '顶部预留，不可放置金属/电池' },
    { name: 'USB-C 接口模块', l: 9, w: 7, h: 3.5, vol: 0.22, note: '底部侧面，防水硅胶塞' },
    { name: '结构件+硅胶壁厚', l: 0, w: 0, h: 0, vol: 8.5, note: '壁厚 2-3mm，占总体积约 25%' },
  ],
}

const usedVol = volumeBudget.components.reduce((s, c) => s + c.vol, 0)
const margin = volumeBudget.effectiveVol - usedVol
const marginPercent = (margin / volumeBudget.effectiveVol * 100)

export default function MechanicalLayout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Box className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">机械堆叠布局分析</h3>
      </div>

      <p className="text-sm text-white/40">
        鹅卵石形态（60×45×25mm）的有效内部体积约 {volumeBudget.effectiveVol.toFixed(1)} cm³（椭球体系数 0.52）。
        以下验证所有元器件是否"放得下"：
      </p>

      {/* ASCII 截面图 */}
      <div className="glass-card p-4 font-mono text-[10px] text-white/50 leading-relaxed overflow-x-auto">
        <p className="text-blue-300 text-xs mb-2">// 纵向截面示意（侧视图，单位 mm）</p>
        <pre className="text-white/40">{`
    ┌──────────────── 60mm ────────────────┐
    │          ╭─────────────────╮          │
    │        ╭─┤  BLE 天线净空区  ├─╮        │ ← 顶部 5mm 无金属
    │      ╭─  └────────┬────────┘  ─╮      │
    │    ╭─    ┌────────┴────────┐    ─╮    │ 25mm
    │  ╭─      │   PCB (1.6mm)   │      ─╮  │
    │ │  [M1]  └─────────────────┘  [M2]  │ │ ← 马达对称放置
    │  ╰─      ┌─────────────────┐      ─╯  │
    │    ╰─    │  电池 (4mm厚)    │    ─╯    │
    │      ╰─  └─────────────────┘  ─╯      │
    │        ╰─── USB-C ──────────╯          │ ← 底部充电口
    │          ╰─────────────────╯           │
    └────────────────────────────────────────┘
         ↑                              ↑
       硅胶壁厚 2.5mm              硅胶壁厚 2.5mm
`}</pre>
        <p className="text-white/30 mt-2">注：实际为 3D 椭球体，此为简化 2D 截面</p>
      </div>

      {/* 体积预算表 */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2.5 text-white/50 font-normal">组件</th>
              <th className="text-right p-2.5 text-white/50 font-normal">尺寸 (mm)</th>
              <th className="text-right p-2.5 text-white/50 font-normal">体积 (cm³)</th>
              <th className="text-left p-2.5 text-white/50 font-normal hidden md:table-cell">布局说明</th>
            </tr>
          </thead>
          <tbody>
            {volumeBudget.components.map(c => (
              <tr key={c.name} className="border-b border-white/5">
                <td className="p-2.5 text-white/70">{c.name}</td>
                <td className="p-2.5 text-right text-white/50 font-mono">
                  {c.l > 0 ? `${c.l}×${c.w}×${c.h}` : '-'}
                </td>
                <td className="p-2.5 text-right text-blue-300 font-mono">{c.vol.toFixed(2)}</td>
                <td className="p-2.5 text-white/30 hidden md:table-cell">{c.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="p-2.5 text-white/80 font-medium">已用体积</td>
              <td className="p-2.5"></td>
              <td className="p-2.5 text-right text-blue-300 font-medium font-mono">{usedVol.toFixed(2)}</td>
              <td className="hidden md:table-cell"></td>
            </tr>
            <tr>
              <td className="p-2.5 text-white/80 font-medium">有效总体积</td>
              <td className="p-2.5"></td>
              <td className="p-2.5 text-right text-white/60 font-mono">{volumeBudget.effectiveVol.toFixed(2)}</td>
              <td className="hidden md:table-cell"></td>
            </tr>
            <tr className="border-t border-white/5">
              <td className="p-2.5 text-white/80 font-medium">余量</td>
              <td className="p-2.5"></td>
              <td className={`p-2.5 text-right font-mono font-medium ${margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {margin.toFixed(2)} ({marginPercent.toFixed(1)}%)
              </td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 结论 */}
      <div className={`glass-card p-4 border-l-2 ${margin > 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <p className="text-sm text-white/70">
          {margin > 0 ? (
            <>
              <span className="text-green-400">✓ 布局可行</span>，余量 {marginPercent.toFixed(1)}%。
              但余量偏紧（工程经验建议 &gt;15%），实际需要 3D CAD 验证干涉情况。
            </>
          ) : (
            <>
              <span className="text-red-400">✗ 布局过紧</span>，需要缩减电池容量或增大外壳尺寸。
            </>
          )}
        </p>
      </div>

      {/* 关键设计约束 */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm text-yellow-300/80">关键机械约束</h4>
        </div>
        <div className="space-y-2 text-xs text-white/40">
          <p><span className="text-white/60">天线净空：</span>nRF52840 PCB 天线需要顶部 5mm 范围内无金属走线、无电池。这直接决定了电池只能放在 PCB 下方，压缩了垂直空间。</p>
          <p><span className="text-white/60">马达振动传导：</span>LRA 马达需要刚性连接到外壳内壁才能有效传导振动。如果用软性硅胶包裹，振动会被吸收。解决方案：马达安装在内部硬质骨架上，骨架与外壳硅胶层之间有刚性接触点。</p>
          <p><span className="text-white/60">充电口防水：</span>USB-C 口位于底部（用户握持时朝下），配硅胶防尘塞。选择底部而非侧面是因为：充电时设备自然立放，不影响使用姿势。</p>
          <p><span className="text-white/60">跌落保护：</span>38g 重量 + 硅胶外壳，1.5m 跌落到硬地面的冲击力约 15G。PCB 需要四角螺丝固定 + 缓冲垫，电池需要泡棉包裹防止位移短路。</p>
        </div>
      </div>

      {/* 下一步 */}
      <div className="glass-card p-4 space-y-2">
        <h4 className="text-sm text-white/60 font-medium">验证路径（如果要做下去）</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>1. Fusion360 建立简化 3D 模型，验证干涉和装配顺序</p>
          <p>2. 3D 打印外壳（光固化树脂），内部用开发板 + 杜邦线验证布局</p>
          <p>3. 找结构工程师评审壁厚、卡扣、模具可行性</p>
          <p>4. 预估开模费用：硅胶压模 ¥3-5万 + 内部骨架注塑 ¥2-3万</p>
        </div>
      </div>
    </div>
  )
}
