'use client'

import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

/**
 * 关键技术风险清单
 * 
 * 硬件PM最值钱的能力是风险识别。
 * 不是列出"我们的产品多牛"，而是诚实地说"哪些地方可能翻车"。
 */

interface Risk {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
  probability: 'high' | 'medium' | 'low'
  description: string
  impact: string
  mitigation: string
  status: 'open' | 'mitigated' | 'accepted'
}

const risks: Risk[] = [
  {
    id: 'R1',
    title: 'LRA 马达疲劳寿命不足',
    severity: 'high',
    probability: 'medium',
    description: 'LRA 马达的弹簧片在长期往复运动后可能疲劳断裂。每次呼吸训练约 8 分钟 × 每秒 1 次振动 = 480 次/session，每天 2 次 = 960 次/天，一年约 35 万次。',
    impact: '设备在保修期内（1年）马达失效，导致大量退货和品牌损伤',
    mitigation: '1) 选择寿命标称 >100 万次的马达型号；2) 固件限制最大振幅为额定值的 80%（降额使用）；3) 做加速寿命测试（HALT），在 50°C/高湿度下跑 200 万次验证',
    status: 'open',
  },
  {
    id: 'R2',
    title: 'BLE 天线性能受硅胶外壳影响',
    severity: 'medium',
    probability: 'high',
    description: '硅胶的介电常数（εr≈3-4）会改变天线的谐振频率和辐射效率。手握设备时人体（εr≈50）进一步吸收信号。',
    impact: 'BLE 连接距离从理论 10m 降至 2-3m，用户手机放远一点就断连',
    mitigation: '1) 天线设计时将硅胶纳入仿真模型（HFSS/CST）；2) 预留天线调谐匹配网络（π型匹配）；3) 实测手握场景下的辐射方向图，必要时改用陶瓷天线',
    status: 'open',
  },
  {
    id: 'R3',
    title: '充电时温升超标',
    severity: 'high',
    probability: 'low',
    description: '200mAh 电池以 1C（200mA）充电时，充电 IC 和电池本身会发热。硅胶外壳导热性差（0.2 W/m·K），热量不易散出。',
    impact: '表面温度超过 45°C 触发安全保护，或长期高温加速电池老化',
    mitigation: '1) 限制充电电流为 0.5C（100mA），充电时间约 2.5h；2) 充电 IC 选择带 NTC 温度监测的型号（如 BQ25100）；3) 在充电 IC 附近开导热通道到外壳',
    status: 'mitigated',
  },
  {
    id: 'R4',
    title: 'Softdevice 与 Zephyr 共存兼容性',
    severity: 'medium',
    probability: 'medium',
    description: 'Nordic 的 Softdevice（BLE 协议栈）和 Zephyr RTOS 对中断优先级有不同的要求。Softdevice 占用最高优先级中断（0-2），应用只能用 3-7。',
    impact: '触觉线程被 BLE 中断抢占，导致振动出现可感知的卡顿（jitter >5ms）',
    mitigation: '1) 改用 Nordic 的 nRF Connect SDK（基于 Zephyr，原生支持 Softdevice 共存）；2) 触觉 PWM 用硬件定时器直接驱动，不依赖软件线程调度；3) 或者放弃 Softdevice，用 Zephyr 原生 BLE 协议栈（开源但功能较少）',
    status: 'open',
  },
  {
    id: 'R5',
    title: '用户握持检测误判',
    severity: 'low',
    probability: 'high',
    description: '用 BMA400 加速度计检测"用户是否在握持设备"——但放在桌上、放在枕头旁、握在手里的加速度特征可能很相似（都是静止）。',
    impact: '设备在无人握持时误触发振动（浪费电），或用户握持时未检测到（不启动）',
    mitigation: '1) 增加电容式触摸检测（成本 +¥1.5，加一颗 AT42QT1010）；2) 或利用马达反电动势（Back-EMF）检测负载变化（握持时阻尼不同）；3) 最简方案：加一个物理按键，用户主动触发',
    status: 'open',
  },
]

const severityColors = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' }
const severityBg = { high: 'bg-red-400/10', medium: 'bg-yellow-400/10', low: 'bg-green-400/10' }
const statusLabels = { open: '待解决', mitigated: '已缓解', accepted: '已接受' }
const statusColors = { open: 'text-red-300', mitigated: 'text-green-300', accepted: 'text-white/40' }

export default function TechRisks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">关键技术风险清单</h3>
      </div>

      <p className="text-sm text-white/40">
        硬件产品经理最值钱的能力不是画 BOM 表，而是在项目早期识别"哪些地方可能翻车"。
        以下是 Top 5 技术风险及缓解方案：
      </p>

      <div className="space-y-4">
        {risks.map((risk, i) => (
          <motion.div
            key={risk.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 space-y-3"
          >
            {/* 标题行 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/30">{risk.id}</span>
                <h4 className="text-sm text-white/80 font-medium">{risk.title}</h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityBg[risk.severity]} ${severityColors[risk.severity]}`}>
                  {risk.severity === 'high' ? '高危' : risk.severity === 'medium' ? '中危' : '低危'}
                </span>
                <span className={`text-[10px] ${statusColors[risk.status]}`}>
                  {statusLabels[risk.status]}
                </span>
              </div>
            </div>

            {/* 描述 */}
            <p className="text-xs text-white/40">{risk.description}</p>

            {/* 影响 */}
            <div>
              <span className="text-[10px] text-white/30">影响：</span>
              <span className="text-xs text-white/50">{risk.impact}</span>
            </div>

            {/* 缓解方案 */}
            <div className="p-2.5 bg-white/[0.03] rounded-lg">
              <span className="text-[10px] text-blue-300/60">缓解方案：</span>
              <p className="text-xs text-white/50 mt-1">{risk.mitigation}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 风险矩阵 */}
      <div className="glass-card p-4 space-y-3">
        <h4 className="text-sm text-white/60 font-medium">风险矩阵</h4>
        <div className="font-mono text-xs text-white/40 overflow-x-auto">
          <pre>{`
  严重度 →    低        中        高
概率 ↓
  高         R5       R2        
  中                  R4       R1
  低                           R3(已缓解)
          `}</pre>
        </div>
        <p className="text-xs text-white/30">
          优先处理右上角（高概率×高严重度）。当前最需关注：R2（天线）和 R1（马达寿命）。
        </p>
      </div>
    </div>
  )
}
