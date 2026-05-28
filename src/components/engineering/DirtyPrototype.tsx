'use client'

import { motion } from 'framer-motion'
import { Hammer, CheckCircle2, Clock, ShoppingCart, AlertCircle } from 'lucide-react'

/**
 * Dirty Prototype 行动计划
 * 
 * 核心理念：不是"我分析了什么"，而是"我下周就能做出什么"。
 * 用 ¥230 + 一个周末，做出能让人摸到的东西。
 */

interface BOMItem {
  name: string
  spec: string
  price: number
  source: string
  url?: string
  inStock: boolean
}

const prototypeBOM: BOMItem[] = [
  { name: 'nRF52840-DK 开发板', spec: 'PCA10056', price: 89, source: '淘宝/Nordic官方', inStock: true },
  { name: 'DRV2605L 驱动板', spec: 'Adafruit #2305 或国产替代', price: 35, source: '淘宝/1688', inStock: true },
  { name: 'LRA 线性马达 ×2', spec: 'Φ8×3.2mm, 235Hz', price: 24, source: '1688 金龙机电', inStock: true },
  { name: '3D 打印外壳', spec: '65×48×28mm 鹅卵石, 光敏树脂', price: 25, source: '嘉立创3D打印', inStock: true },
  { name: '配重铅块', spec: '调整到目标 45g', price: 5, source: '五金店', inStock: true },
  { name: '杜邦线 + 面包板', spec: '连接开发板与马达', price: 12, source: '淘宝', inStock: true },
  { name: '200mAh 锂电池', spec: '302040 含保护板', price: 15, source: '1688', inStock: true },
  { name: '硅胶套（可选）', spec: '翻模硅胶 + 3D打印模具', price: 25, source: '淘宝', inStock: true },
]

const totalCost = prototypeBOM.reduce((s, i) => s + i.price, 0)

interface WeekendTask {
  day: string
  tasks: { time: string; action: string; deliverable: string }[]
}

const weekendPlan: WeekendTask[] = [
  {
    day: '周六上午',
    tasks: [
      { time: '9:00-10:00', action: '焊接 DRV2605L 驱动板 → LRA 马达', deliverable: '马达能响' },
      { time: '10:00-12:00', action: 'nRF52840-DK 烧录基础固件（I2C → RTP 模式）', deliverable: '开发板能控制马达振动强度' },
    ]
  },
  {
    day: '周六下午',
    tasks: [
      { time: '13:00-15:00', action: '实现呼吸曲线映射（4-7-8 法 → RTP 值序列）', deliverable: '马达按呼吸节奏振动' },
      { time: '15:00-17:00', action: '调参：找到"舒适区"振动强度范围', deliverable: '确定 inhale/hold/exhale 各阶段最佳 RTP 值' },
    ]
  },
  {
    day: '周六晚上',
    tasks: [
      { time: '20:00-22:00', action: '3D 打印外壳到货，试装电路 + 配重', deliverable: '能握在手里的物理原型' },
    ]
  },
  {
    day: '周日',
    tasks: [
      { time: '全天', action: '找 5 个朋友测试：闭眼握住，跟随振动呼吸 5 分钟', deliverable: '5 份用户反馈（舒适度/节奏感/入睡意愿）' },
    ]
  },
]

const validationQuestions = [
  { question: '握住时能否自然感知到"吸气/呼气"的节奏？', critical: true },
  { question: '振动强度是否在"能感知但不打扰"的范围内？', critical: true },
  { question: '5 分钟后是否感觉比之前更放松？', critical: true },
  { question: '鹅卵石形态握持是否舒适？重量是否合适？', critical: false },
  { question: '是否愿意每晚使用？如果不愿意，原因是什么？', critical: false },
  { question: '对比手机引导呼吸 App，这个设备的优势在哪？', critical: false },
]

export default function DirtyPrototype() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Hammer className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg text-white/90 font-medium">Dirty Prototype 行动计划</h3>
      </div>

      {/* 核心理念 */}
      <div className="glass-card p-4 border-l-2 border-orange-500/50">
        <p className="text-sm text-white/60">
          <span className="text-orange-300">¥{totalCost} + 一个周末</span> = 一个能握在手里、能让人闭眼跟随呼吸的物理原型。
          不需要完美，只需要回答一个问题：<span className="text-white/80">"触觉引导呼吸，到底有没有用？"</span>
        </p>
      </div>

      {/* 采购清单 */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-white/50" />
            <h4 className="text-sm text-white/60">采购清单（全部现货可得）</h4>
          </div>
          <span className="text-xs text-orange-300 font-mono">总计 ¥{totalCost}</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-white/50 font-normal">物料</th>
              <th className="text-left p-2 text-white/50 font-normal hidden sm:table-cell">规格</th>
              <th className="text-right p-2 text-white/50 font-normal">价格</th>
              <th className="text-center p-2 text-white/50 font-normal">状态</th>
            </tr>
          </thead>
          <tbody>
            {prototypeBOM.map(item => (
              <tr key={item.name} className="border-b border-white/5">
                <td className="p-2 text-white/70">{item.name}</td>
                <td className="p-2 text-white/40 hidden sm:table-cell">{item.spec}</td>
                <td className="p-2 text-right text-orange-300 font-mono">¥{item.price}</td>
                <td className="p-2 text-center">
                  {item.inStock ? (
                    <span className="text-green-400 text-[10px]">现货</span>
                  ) : (
                    <span className="text-yellow-400 text-[10px]">需等</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 周末行动计划 */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm text-white/60 font-medium">一个周末的行动计划</h4>
        </div>
        <div className="space-y-4">
          {weekendPlan.map(day => (
            <div key={day.day} className="space-y-2">
              <p className="text-xs text-blue-300/80 font-medium">{day.day}</p>
              {day.tasks.map((task, i) => (
                <div key={i} className="flex gap-3 pl-3 border-l border-white/10">
                  <span className="text-[10px] text-white/30 font-mono whitespace-nowrap mt-0.5">{task.time}</span>
                  <div className="flex-1">
                    <p className="text-xs text-white/60">{task.action}</p>
                    <p className="text-[10px] text-green-400/50 mt-0.5">→ {task.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 验证问题 */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm text-white/60 font-medium">原型测试必须回答的问题</h4>
        </div>
        <div className="space-y-2">
          {validationQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${q.critical ? 'bg-red-400' : 'bg-white/30'}`} />
              <p className={`text-xs ${q.critical ? 'text-white/70' : 'text-white/40'}`}>
                {q.question}
                {q.critical && <span className="text-red-400/60 ml-1">(核心假设)</span>}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/30 pt-2 border-t border-white/5">
          如果前 3 个核心问题的答案都是"否"，则需要重新审视产品方向，而非继续优化细节。
        </p>
      </div>

      {/* 与纸面分析的对比 */}
      <div className="glass-card p-4 space-y-3 border-l-2 border-orange-500/30">
        <h4 className="text-sm text-white/60 font-medium">为什么 Dirty Prototype 比纸面分析更有价值</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/[0.03] rounded-lg space-y-2">
            <p className="text-white/50 font-medium">纸面分析能告诉你的</p>
            <div className="text-white/30 space-y-1">
              <p>• 理论上功耗够不够</p>
              <p>• 理论上体积放不放得下</p>
              <p>• 理论上成本是多少</p>
              <p>• 理论上延迟链路多长</p>
            </div>
          </div>
          <div className="p-3 bg-orange-500/5 rounded-lg space-y-2 border border-orange-500/10">
            <p className="text-orange-300/80 font-medium">Dirty Prototype 能告诉你的</p>
            <div className="text-white/40 space-y-1">
              <p>• 握在手里到底什么感觉</p>
              <p>• 振动能不能引导呼吸节奏</p>
              <p>• 用户闭眼 5 分钟后的真实反应</p>
              <p>• 哪些"理论可行"实际做不到</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
