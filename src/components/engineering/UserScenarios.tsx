'use client'

import { motion } from 'framer-motion'
import { Users, HelpCircle } from 'lucide-react'

/**
 * 用户场景"脏活" —— 那些看似琐碎但决定产品成败的设计决策
 * 
 * 硬件PM每天要拍板的不是"要不要用AI"这种大问题，
 * 而是"充电口朝哪边"、"用户睡着了设备怎么办"这种小问题。
 * 这些小问题的答案，才是产品体验的真正分水岭。
 */

interface DesignDecision {
  question: string
  context: string
  options: { label: string; pros: string; cons: string }[]
  decision: string
  reasoning: string
}

const decisions: DesignDecision[] = [
  {
    question: '用户握着设备睡着了，设备怎么办？',
    context: '这是最核心的使用场景——产品的目标就是让用户入睡。但入睡后设备仍在手中，可能掉落、被压在身下、或持续振动干扰睡眠。',
    options: [
      { label: '加速度计检测静止→自动关机', pros: '省电，不干扰', cons: '可能误判（用户只是闭眼休息）' },
      { label: '固定时长后自动停止', pros: '简单可靠', cons: '如果用户还没睡着就停了' },
      { label: '渐弱模式：最后2分钟逐渐降低振幅至零', pros: '自然过渡，不突兀', cons: '实现稍复杂' },
    ],
    decision: '方案C：渐弱模式 + 10分钟超时保护',
    reasoning: '呼吸引导的目标是让用户"忘记设备的存在"。突然停止振动反而可能唤醒用户。渐弱模式模拟了"设备陪你一起入睡"的感觉。超时保护兜底防止异常情况下持续振动。',
  },
  {
    question: '设备掉到地上会怎样？',
    context: '用户入睡后手部肌肉放松，38g的设备大概率会从手中滑落。床高约50cm，如果掉到硬地面...',
    options: [
      { label: '硅胶外壳吸震', pros: '被动保护，无额外成本', cons: '内部PCB仍可能受冲击' },
      { label: '加内部缓冲结构', pros: '保护电子元件', cons: '增加体积和成本' },
      { label: '设计为"掉了也没关系"', pros: '降低用户焦虑', cons: '需要可靠性验证' },
    ],
    decision: '全部都要：硅胶外壳 + PCB四角硅胶垫 + 跌落检测自动关机',
    reasoning: '50cm跌落到硬地面，38g设备的冲击加速度约100G（计算：v=√(2gh)=3.1m/s，假设硅胶变形2mm吸能，a=v²/2s≈2400m/s²≈245G，硅胶可吸收60%→实际约100G）。PCB需要通过100G冲击测试。加速度计检测到自由落体（0G持续>50ms）后立即关闭马达PWM输出，防止跌落瞬间马达异常抖动。',
  },
  {
    question: '充电接口朝哪个方向？',
    context: '用户使用场景：睡前在床头柜上充电。需要考虑：充电时能否同时使用？线缆会不会碍事？',
    options: [
      { label: '底部', pros: '充电时设备可以"立"在桌上，像个摆件', cons: '充电时无法握持使用' },
      { label: '侧面', pros: '充电时仍可握持', cons: '线缆从侧面伸出，握持不舒服' },
      { label: '磁吸无线充', pros: '无开孔，防水好', cons: '成本+¥15，效率低，充电慢' },
    ],
    decision: '底部 USB-C + 硅胶防尘塞',
    reasoning: '核心洞察：用户不会边充电边用。使用场景是睡前8-10分钟，一周充一次电。充电是"非使用时间"的行为。底部接口让设备充电时自然立放在床头柜上，还能当个小夜灯（呼吸灯效果）。磁吸方案虽好但成本敏感期不值得。',
  },
  {
    question: '怎么开机？用户在黑暗中能盲操作吗？',
    context: '使用场景是睡前关灯后。用户不想开灯、不想看手机屏幕。需要纯触觉/盲操作完成"拿起→开机→开始训练"。',
    options: [
      { label: '物理按键', pros: '确定性高，盲操作友好', cons: '增加开孔，影响防水和外观' },
      { label: '拿起自动唤醒（加速度计）', pros: '零操作，最自然', cons: '误触发风险（被子碰到）' },
      { label: '握持检测（电容触摸）', pros: '握住即开始', cons: '需要额外传感器' },
    ],
    decision: '拿起唤醒 + 握持确认（双重验证）',
    reasoning: '加速度计检测到从静止→运动（被拿起），进入"待命态"（低功耗BLE广播）。然后通过马达反电动势检测握持（握住时马达阻尼特征不同），确认后开始训练。整个过程零按键、零视觉。如果5秒内未检测到握持，回到休眠。这样既避免误触发，又实现了"拿起就用"的体验。',
  },
  {
    question: '设备表面材质怎么选？',
    context: '用户握着入睡，手心会出汗。材质需要：亲肤、防滑、不粘腻、易清洁、能传导振动。',
    options: [
      { label: '液态硅胶（LSR）', pros: '亲肤、防滑、医疗级', cons: '容易沾灰、时间久了发黄' },
      { label: '热塑性弹性体（TPE）', pros: '成本低、不沾灰', cons: '手感偏硬、有塑料感' },
      { label: '硅胶+植绒', pros: '触感极佳、不粘手', cons: '不耐磨、难清洁' },
    ],
    decision: '医疗级液态硅胶（Shore A 40°）+ 表面微纹理处理',
    reasoning: '硬度 Shore A 40° 接近人体软组织手感（参考 Apple Watch 运动表带）。表面做细微磨砂纹理（Ra 1.6-3.2μm），解决"沾灰"和"粘腻"问题。选择添加抗菌剂的配方（银离子），解决长期握持的卫生问题。成本比普通硅胶贵约 30%，但这是用户每天接触的界面，值得投入。',
  },
]

export default function UserScenarios() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">用户场景设计决策</h3>
      </div>

      <p className="text-sm text-white/40">
        硬件产品的灵魂不在 BOM 表里，在这些"看似琐碎但决定体验"的设计决策中。
        每个决策都有 trade-off，没有完美答案，只有"在约束下的最优折衷"。
      </p>

      <div className="space-y-6">
        {decisions.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 space-y-4"
          >
            {/* 问题 */}
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm text-white/80 font-medium">{d.question}</h4>
                <p className="text-xs text-white/30 mt-1">{d.context}</p>
              </div>
            </div>

            {/* 选项对比 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {d.options.map((opt, j) => (
                <div key={j} className="p-2.5 bg-white/[0.02] rounded-lg text-xs">
                  <p className="text-white/60 font-medium">{opt.label}</p>
                  <p className="text-green-400/60 mt-1">+ {opt.pros}</p>
                  <p className="text-red-400/60">- {opt.cons}</p>
                </div>
              ))}
            </div>

            {/* 决策 */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-xs text-blue-300 font-medium">决策：{d.decision}</p>
              <p className="text-xs text-white/40 mt-1">{d.reasoning}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
