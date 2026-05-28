'use client'

import { motion } from 'framer-motion'
import { Search, ExternalLink, Scale, Zap } from 'lucide-react'

/**
 * 竞品实物拆解框架
 * 
 * 不是"我觉得竞品怎么样"，而是"我拆开看了里面是什么"。
 * 即使还没买到实物，也要建立拆解框架，明确要看什么。
 */

interface Competitor {
  name: string
  price: string
  category: string
  mechanism: string
  formFactor: string
  keySpecs: string[]
  teardownInsights: string[]
  whatToLearn: string[]
  purchaseUrl?: string
  status: 'to-purchase' | 'purchased' | 'teardown-done'
}

const competitors: Competitor[] = [
  {
    name: 'Moonbird',
    price: '€199 (~¥1550)',
    category: '呼吸引导设备（直接竞品）',
    mechanism: '物理膨胀/收缩（气囊驱动），握持跟随呼吸',
    formFactor: '鸟形，约 120×50mm，含气泵',
    keySpecs: [
      '气泵驱动物理膨胀（非振动）',
      'BLE 连接 App',
      '内置心率传感器（PPG）',
      '充电续航约 4 小时',
      '重量约 80g',
    ],
    teardownInsights: [
      '气泵方案的优势：物理膨胀比振动更直觉，用户无需学习',
      '气泵方案的劣势：噪音、体积大、机械寿命有限',
      '定价 €199 说明市场接受高端呼吸设备',
      'App 生态是核心壁垒（引导课程 + 数据追踪）',
    ],
    whatToLearn: [
      '气泵的噪音水平（dB）——如果 >30dB 则影响入睡',
      '膨胀幅度和速度——多大的物理变化才能被感知',
      '电池容量和气泵功耗——气泵方案的功耗瓶颈',
      'PCB 布局和传感器位置——PPG 在握持设备上的信噪比',
      '外壳材质和配重——握持舒适度的工程实现',
    ],
    status: 'to-purchase',
  },
  {
    name: 'Dodow',
    price: '€49.99 (~¥390)',
    category: '呼吸引导设备（视觉方案）',
    mechanism: '天花板投射光圈，跟随光圈大小呼吸',
    formFactor: '圆盘形，Φ100×25mm，放床头柜',
    keySpecs: [
      'LED 投射蓝光圆圈到天花板',
      '无 App、无 BLE（纯离线）',
      '8 分钟 / 20 分钟两档',
      'AAA 电池供电',
      '极简交互（触摸顶部开关）',
    ],
    teardownInsights: [
      '极简设计哲学：无 App、无连接、无订阅',
      '成本极低（LED + 简单 MCU + 电池座），BOM 估计 <¥30',
      '累计销量 >100 万台，证明呼吸引导市场存在',
      '用户评价两极分化：有人说有效，有人说"就是个灯"',
    ],
    whatToLearn: [
      'LED 驱动方案——如何实现平滑的亮度渐变',
      '光学设计——如何在天花板投射清晰圆圈',
      '成本控制——如何把 BOM 压到 ¥30 以下',
      '用户差评分析——"无效"的用户是什么特征',
      '包装和说明书设计——如何降低退货率',
    ],
    status: 'to-purchase',
  },
  {
    name: 'Apple Watch 呼吸 App',
    price: '（随设备附带）',
    category: '软件方案（间接竞品）',
    mechanism: 'Taptic Engine 触觉 + 视觉动画引导',
    formFactor: '手腕佩戴',
    keySpecs: [
      'Taptic Engine 线性马达触觉反馈',
      '花瓣动画视觉引导',
      '1-5 分钟可选时长',
      '心率监测 + 呼吸后 HRV 对比',
      '系统级集成，推送提醒',
    ],
    teardownInsights: [
      'Apple 验证了"触觉引导呼吸"的可行性',
      '但手腕触觉 vs 手掌触觉——手掌神经密度更高',
      '手表屏幕太小，视觉引导效果有限',
      '用户使用频率低——说明"提醒"不够，需要"场景触发"',
    ],
    whatToLearn: [
      'Taptic Engine 的振动模式设计——Apple 如何映射呼吸节奏',
      '用户留存数据——呼吸 App 的 7 日/30 日留存率',
      '为什么用户不坚持——是产品问题还是需求问题',
      '触觉强度设置——Apple 选择了什么强度范围',
    ],
    status: 'to-purchase',
  },
]

const differentiationMatrix = [
  { dimension: '感知通道', ours: '手掌触觉（LRA振动）', moonbird: '手掌触觉（物理膨胀）', dodow: '视觉（天花板光圈）', appleWatch: '手腕触觉' },
  { dimension: '闭眼可用', ours: '✓ 纯触觉', moonbird: '✓ 纯触觉', dodow: '✗ 需要看', appleWatch: '✓ 但需佩戴' },
  { dimension: '噪音', ours: '无（LRA静音）', moonbird: '有（气泵）', dodow: '无', appleWatch: '无' },
  { dimension: '体积', ours: '65×48×28mm', moonbird: '~120×50mm', dodow: 'Φ100×25mm', appleWatch: '手表' },
  { dimension: '价格', ours: '¥299（目标）', moonbird: '¥1550', dodow: '¥390', appleWatch: '¥2999+' },
  { dimension: '数据追踪', ours: 'App + HRV', moonbird: 'App + HR', dodow: '无', appleWatch: '系统级' },
]

export default function CompetitorTeardown() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg text-white/90 font-medium">竞品拆解框架</h3>
      </div>

      <div className="glass-card p-4 border-l-2 border-purple-500/50">
        <p className="text-sm text-white/50">
          <span className="text-purple-300">不是"我觉得竞品怎么样"</span>，而是"我买了、拆了、量了、测了"。
          以下是拆解计划——明确要看什么、学什么、我们的差异化在哪。
        </p>
        <p className="text-xs text-white/30 mt-2">
          状态：目前为拆解框架阶段，实物采购后将补充实测数据。
        </p>
      </div>

      {/* 竞品卡片 */}
      <div className="space-y-4">
        {competitors.map((comp, idx) => (
          <motion.div
            key={comp.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm text-white/80 font-medium">{comp.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{comp.price}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    comp.status === 'teardown-done' ? 'bg-green-500/10 text-green-300' :
                    comp.status === 'purchased' ? 'bg-blue-500/10 text-blue-300' :
                    'bg-white/5 text-white/40'
                  }`}>
                    {comp.status === 'teardown-done' ? '已拆解' : comp.status === 'purchased' ? '已购买' : '待采购'}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 mt-1">{comp.category}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">工作原理</p>
                <p className="text-xs text-white/60">{comp.mechanism}</p>
              </div>

              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">关键规格</p>
                <div className="flex flex-wrap gap-1.5">
                  {comp.keySpecs.map((spec, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50">{spec}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">已知洞察</p>
                <div className="space-y-1">
                  {comp.teardownInsights.map((insight, i) => (
                    <p key={i} className="text-[11px] text-white/50 pl-2 border-l border-purple-500/20">{insight}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-orange-300/60 uppercase tracking-wider mb-1">拆解时要看什么</p>
                <div className="space-y-1">
                  {comp.whatToLearn.map((item, i) => (
                    <p key={i} className="text-[11px] text-white/40 pl-2 border-l border-orange-500/20">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 差异化矩阵 */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 border-b border-white/5 flex items-center gap-2">
          <Scale className="w-4 h-4 text-white/50" />
          <h4 className="text-sm text-white/60">差异化定位矩阵</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-white/50 font-normal">维度</th>
                <th className="text-center p-2 text-blue-300 font-medium">BreathAnchor</th>
                <th className="text-center p-2 text-white/50 font-normal">Moonbird</th>
                <th className="text-center p-2 text-white/50 font-normal">Dodow</th>
                <th className="text-center p-2 text-white/50 font-normal">Apple Watch</th>
              </tr>
            </thead>
            <tbody>
              {differentiationMatrix.map(row => (
                <tr key={row.dimension} className="border-b border-white/5">
                  <td className="p-2 text-white/60">{row.dimension}</td>
                  <td className="p-2 text-center text-blue-300/80">{row.ours}</td>
                  <td className="p-2 text-center text-white/40">{row.moonbird}</td>
                  <td className="p-2 text-center text-white/40">{row.dodow}</td>
                  <td className="p-2 text-center text-white/40">{row.appleWatch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 我们的差异化假设 */}
      <div className="glass-card p-4 space-y-3 border-l-2 border-blue-500/30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm text-white/60 font-medium">差异化假设（待验证）</h4>
        </div>
        <div className="text-xs text-white/40 space-y-2">
          <p>
            <span className="text-white/60">假设 1：</span>LRA 振动可以模拟"膨胀/收缩"的触觉感受，
            效果接近 Moonbird 的气泵方案，但无噪音、体积更小、成本低 80%。
            <span className="text-red-300/60">（核心风险：可能振动就是振动，无法产生"膨胀感"）</span>
          </p>
          <p>
            <span className="text-white/60">假设 2：</span>¥299 的价格点可以覆盖 Dodow 的用户群（嫌 Dodow 太简单）
            和 Moonbird 的潜在用户（嫌 Moonbird 太贵）。
          </p>
          <p>
            <span className="text-white/60">假设 3：</span>手掌握持比手腕佩戴更适合入睡场景——
            因为入睡时人会自然松手（设备掉落 = 入睡信号），而手表会一直戴着。
          </p>
        </div>
        <p className="text-[10px] text-white/30 pt-2 border-t border-white/5">
          以上假设都需要 Dirty Prototype 阶段验证。如果假设 1 被证伪，整个产品方向需要 pivot。
        </p>
      </div>
    </div>
  )
}
