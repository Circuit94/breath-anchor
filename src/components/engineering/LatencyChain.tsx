'use client'

import { motion } from 'framer-motion'
import { Timer, ArrowRight } from 'lucide-react'

/**
 * 端到端延迟链路拆解
 * 
 * 核心问题：从"App下发呼吸指令"到"用户感受到马达振动"，到底需要多少ms？
 * 这不是一个可以拍脑袋的数字，需要逐段拆解。
 */

interface LatencySegment {
  stage: string
  min: number
  typical: number
  max: number
  note: string
  source: string
  optimizable: boolean
}

const latencyChain: LatencySegment[] = [
  {
    stage: 'App 指令编码',
    min: 0.5,
    typical: 1,
    max: 3,
    note: '将呼吸阶段参数编码为 BLE GATT Write 指令',
    source: '软件实现，可优化',
    optimizable: true,
  },
  {
    stage: 'BLE 连接间隔等待',
    min: 0,
    typical: 7.5,
    max: 15,
    note: 'CI=15ms 时平均等待 7.5ms；CI=7.5ms 可降至 3.75ms 但功耗翻倍',
    source: 'BLE Core Spec v5.0 §4.5.1',
    optimizable: true,
  },
  {
    stage: 'BLE 协议栈处理',
    min: 0.3,
    typical: 0.8,
    max: 2,
    note: 'Softdevice S140 GATT Write → 应用层回调',
    source: 'Nordic Softdevice S140 timing',
    optimizable: false,
  },
  {
    stage: '固件指令解析',
    min: 0.01,
    typical: 0.05,
    max: 0.1,
    note: '解析 4 字节指令（type + intensity + duration + pattern）',
    source: 'Cortex-M4 @64MHz',
    optimizable: false,
  },
  {
    stage: 'DRV2605L I2C 通信',
    min: 0.2,
    typical: 0.4,
    max: 1,
    note: 'I2C @400kHz 写入波形寄存器（3-5 bytes）',
    source: 'TI DRV2605L DS §7.5',
    optimizable: false,
  },
  {
    stage: 'LRA 马达机械响应',
    min: 5,
    typical: 8,
    max: 15,
    note: '从静止到目标振幅的上升时间，受马达品质因数 Q 影响',
    source: 'Jinlong G0832 实测（需验证）',
    optimizable: false,
  },
]

// 两种方案对比
const scenarios = [
  {
    name: '方案A：标准 BLE (CI=15ms)',
    ci: 15,
    totalTypical: 0,
    totalMax: 0,
    pros: '功耗低，适合长续航',
    cons: '最坏情况延迟可能超过 35ms',
  },
  {
    name: '方案B：低延迟 BLE (CI=7.5ms) + Connection Event Extension',
    ci: 7.5,
    totalTypical: 0,
    totalMax: 0,
    pros: '延迟可控在 20ms 内',
    cons: 'BLE 功耗增加约 80%，续航降至 5 天',
  },
]

export default function LatencyChain() {
  const totalMin = latencyChain.reduce((s, seg) => s + seg.min, 0)
  const totalTypical = latencyChain.reduce((s, seg) => s + seg.typical, 0)
  const totalMax = latencyChain.reduce((s, seg) => s + seg.max, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Timer className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">端到端延迟链路拆解</h3>
      </div>

      <p className="text-sm text-white/40">
        &ldquo;20ms 触觉延迟&rdquo;不是一个可以直接声称的数字。以下是从 App 指令发出到用户感知振动的完整链路拆解：
      </p>

      {/* 链路可视化 */}
      <div className="glass-card p-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[600px]">
          {latencyChain.map((seg, i) => (
            <div key={seg.stage} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`px-2 py-3 rounded-lg text-center min-w-[90px] ${
                  seg.optimizable ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5 border border-white/10'
                }`}
              >
                <p className="text-[10px] text-white/50 leading-tight">{seg.stage}</p>
                <p className="text-sm text-blue-300 font-mono mt-1">{seg.typical}ms</p>
              </motion.div>
              {i < latencyChain.length - 1 && (
                <ArrowRight className="w-3 h-3 text-white/20 mx-0.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 详细数据表 */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2.5 text-white/50 font-normal">阶段</th>
              <th className="text-right p-2.5 text-white/50 font-normal">最小</th>
              <th className="text-right p-2.5 text-white/50 font-normal">典型</th>
              <th className="text-right p-2.5 text-white/50 font-normal">最大</th>
              <th className="text-left p-2.5 text-white/50 font-normal hidden md:table-cell">说明</th>
            </tr>
          </thead>
          <tbody>
            {latencyChain.map(seg => (
              <tr key={seg.stage} className="border-b border-white/5">
                <td className="p-2.5 text-white/70">{seg.stage}</td>
                <td className="p-2.5 text-right text-white/40 font-mono">{seg.min}</td>
                <td className="p-2.5 text-right text-blue-300 font-mono">{seg.typical}</td>
                <td className="p-2.5 text-right text-white/40 font-mono">{seg.max}</td>
                <td className="p-2.5 text-white/30 hidden md:table-cell">{seg.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td className="p-2.5 text-white/80 font-medium">端到端总计</td>
              <td className="p-2.5 text-right text-white/50 font-mono">{totalMin.toFixed(1)}ms</td>
              <td className="p-2.5 text-right text-blue-300 font-mono font-medium">{totalTypical.toFixed(1)}ms</td>
              <td className="p-2.5 text-right text-white/50 font-mono">{totalMax.toFixed(1)}ms</td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 关键决策点 */}
      <div className="glass-card p-4 space-y-3">
        <h4 className="text-sm text-white/60 font-medium">工程折衷决策</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white/[0.03] rounded-lg">
            <p className="text-xs text-white/70 font-medium">方案 A：CI=15ms（推荐）</p>
            <p className="text-xs text-white/40 mt-1">
              典型延迟 {totalTypical.toFixed(1)}ms，最坏 {totalMax.toFixed(1)}ms。
              虽然最坏情况接近感知阈值（50ms），但呼吸引导是<span className="text-white/60">连续渐变</span>而非离散触发——
              用户感知的是"节奏是否平滑"而非"单次响应是否即时"。因此 15ms CI 足够。
            </p>
          </div>
          <div className="p-3 bg-white/[0.03] rounded-lg">
            <p className="text-xs text-white/70 font-medium">方案 B：CI=7.5ms + 预测式驱动</p>
            <p className="text-xs text-white/40 mt-1">
              将呼吸方案整体下发到设备端，固件本地执行定时器驱动马达，BLE 仅做同步校准。
              这样<span className="text-white/60">消除了 BLE 连接间隔等待</span>，端到端延迟降至 ~10ms，
              但增加了固件复杂度（需要本地呼吸状态机）。
            </p>
            <p className="text-xs text-blue-300/60 mt-2">
              → 最终选择：方案 B。呼吸节奏是可预测的，没必要每个 phase 都实时下发。
              设备端存储完整方案，自主执行，App 仅做启停和进度同步。
            </p>
          </div>
        </div>
      </div>

      {/* 与竞品对比 */}
      <div className="glass-card p-4 space-y-2">
        <h4 className="text-sm text-white/60 font-medium">为什么这个延迟 OK？</h4>
        <p className="text-xs text-white/40">
          人体触觉时间分辨率约 5-40ms（取决于身体部位，手掌约 20-30ms）。
          但 BreathAnchor 的触觉不是"按钮反馈"式的离散事件，而是<span className="text-white/60">连续渐变的振动包络</span>。
          类比：你不会感知到音箱的 10ms 延迟，因为音乐是连续的。
          同理，只要振动的<span className="text-white/60">节奏稳定性</span>（jitter &lt; 5ms）有保证，
          绝对延迟在 20ms 以内对用户体验无感知影响。
        </p>
        <p className="text-xs text-white/30 mt-2">
          参考文献：Gescheider et al. (2009) &ldquo;Psychophysics of Vibrotactile Temporal Processing&rdquo;
        </p>
      </div>
    </div>
  )
}
