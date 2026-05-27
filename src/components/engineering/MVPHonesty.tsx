'use client'

import { motion } from 'framer-motion'
import { Target, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

/**
 * MVP 诚实性声明 v3 —— 这个线上 MVP 到底验证了什么？
 * 
 * 一个好的 PM 不会说"我的 MVP 验证了一切"，
 * 而是清楚地知道"我验证了什么、没验证什么、下一步怎么补"。
 * 
 * v3 新增：明确区分"纸面分析"和"实物验证"，
 * 诚实承认所有工程验证目前都停留在纸面阶段。
 */

interface Hypothesis {
  statement: string
  validated: boolean
  method: string
  result?: string
  limitation?: string
}

const hypotheses: Hypothesis[] = [
  {
    statement: '用户愿意使用引导呼吸工具来辅助入睡',
    validated: true,
    method: '线上 MVP 可验证：用户是否愿意打开页面、选择场景、开始训练',
    result: '可通过埋点数据验证：页面停留时长、训练完成率、次日留存',
  },
  {
    statement: 'AI 个性化方案比固定方案更受欢迎',
    validated: true,
    method: '线上 MVP 可验证：A/B 测试默认方案 vs AI 生成方案的完成率差异',
    result: '需要至少 200 个用户样本才能得出统计显著结论',
  },
  {
    statement: '用户愿意为此付费（¥299 硬件 + ¥19.9/月订阅）',
    validated: false,
    method: '线上 MVP 部分验证：可以做"预约购买"按钮测试购买意愿',
    limitation: '线上测试的购买意愿与实际付费行为有显著差距（通常转化率 <10%）',
  },
  {
    statement: '触觉引导比视觉/音频引导更有效',
    validated: false,
    method: '线上 MVP 无法验证：手机振动 ≠ 专用 LRA 马达的精细触觉',
    limitation: '手机 ERM/LRA 马达精度低、延迟高、振动模式粗糙，无法模拟产品级触觉体验。这是核心差异化卖点，恰恰是线上 MVP 最大的盲区。',
  },
  {
    statement: '鹅卵石形态的握持体验优于手机/手环',
    validated: false,
    method: '需要物理原型验证：3D 打印外壳 + 配重模拟',
    limitation: '形态、重量、材质的体验只能通过实物验证，任何线上模拟都是自欺欺人',
  },
  {
    statement: '设备能在 65×48×28mm 体积内实现所有功能',
    validated: false,
    method: '需要 3D CAD 建模 + 实际堆叠验证',
    limitation: '本项目的机械布局分析是理论计算（v3 已补充 FPC/ESD/公差体积），但仍需实物验证',
  },
]

// v3 新增：纸面分析 vs 实物验证的诚实对照表
const verificationStatus = [
  {
    item: '功耗计算',
    paperStatus: '已完成（基于 Datasheet 典型值）',
    physicalStatus: '未验证',
    gap: 'Datasheet 典型值 vs 实际值可能差 20-50%（温度、工艺批次影响）',
    effort: '烧录固件 + 万用表测电流，2小时',
  },
  {
    item: '延迟链路',
    paperStatus: '已完成（基于协议规范 + 芯片手册）',
    physicalStatus: '未验证',
    gap: 'BLE 连接间隔实际抖动、I2C 总线仲裁延迟、马达机械响应时间',
    effort: '示波器测量端到端延迟，需要完整硬件，4小时',
  },
  {
    item: '机械布局',
    paperStatus: '已完成（体积估算 + ASCII 截面图）',
    physicalStatus: '未验证',
    gap: '2D 估算无法发现 3D 干涉、装配顺序冲突、热膨胀间隙不足',
    effort: 'Fusion360 建模 2天 + 3D 打印 ¥50 + 试装 1天',
  },
  {
    item: 'BOM 成本',
    paperStatus: '已完成（在线查价 + 行业经验估算）',
    physicalStatus: '未验证',
    gap: '实际询价可能因 MOQ、交期、定制费产生 15-30% 偏差',
    effort: '联系 3 家供应商询价，1周',
  },
  {
    item: '触觉体验',
    paperStatus: '方案设计完成（RTP 模式 + 呼吸曲线映射）',
    physicalStatus: '未验证',
    gap: '振动强度/频率的"舒适区"只能通过人体测试确定，无法纸面推导',
    effort: '开发板 + DRV2605L 驱动板 + LRA 马达，¥230 + 调参 3天',
  },
  {
    item: 'BLE 连接稳定性',
    paperStatus: '协议设计完成（GATT 服务定义）',
    physicalStatus: '未验证',
    gap: '实际环境中的干扰、iOS/Android 兼容性、重连策略',
    effort: '烧录固件 + 手机 App 连接测试，2天',
  },
]

const nextSteps = [
  {
    phase: '当前（线上 MVP）',
    validates: '用户需求存在性、AI 方案吸引力、基本交互流程',
    cost: '¥0（纯软件）',
    timeline: '已完成',
  },
  {
    phase: '下一步（物理原型）',
    validates: '触觉引导有效性、握持体验、核心技术可行性',
    cost: '~¥230（开发板+马达）',
    timeline: '1-2 周',
  },
  {
    phase: '再下一步（用户测试）',
    validates: '产品-市场匹配、付费意愿、使用频率',
    cost: '~¥2000（10 套原型 + 用户招募）',
    timeline: '3-4 周',
  },
  {
    phase: '最终（工程样机）',
    validates: '量产可行性、成本控制、可靠性',
    cost: '~¥15-20 万（开模+认证+小批量）',
    timeline: '3-6 月',
  },
]

export default function MVPHonesty() {
  const validatedCount = hypotheses.filter(h => h.validated).length
  const totalCount = hypotheses.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">MVP 诚实性声明</h3>
      </div>

      <div className="glass-card p-4 border-l-2 border-blue-500/50">
        <p className="text-sm text-white/50">
          这个线上 MVP 能验证 <span className="text-blue-300">{validatedCount}/{totalCount}</span> 个核心假设。
          剩余 {totalCount - validatedCount} 个假设需要物理原型和用户测试才能回答。
          <span className="text-white/70"> 诚实地承认边界，比假装验证了一切更有说服力。</span>
        </p>
      </div>

      {/* 假设验证清单 */}
      <div className="space-y-3">
        {hypotheses.map((h, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 space-y-2"
          >
            <div className="flex items-start gap-2">
              {h.validated ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400/60 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-white/70">{h.statement}</p>
                <p className="text-xs text-white/30 mt-1">{h.method}</p>
                {h.result && <p className="text-xs text-green-400/60 mt-1">{h.result}</p>}
                {h.limitation && <p className="text-xs text-red-400/50 mt-1">{h.limitation}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 验证路径 */}
      <div className="glass-card p-4 space-y-4">
        <h4 className="text-sm text-white/60 font-medium">渐进式验证路径</h4>
        <div className="space-y-3">
          {nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                i === 0 ? 'bg-green-400' : i === 1 ? 'bg-blue-400 ring-2 ring-blue-400/20' : 'bg-white/20'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/70 font-medium">{step.phase}</span>
                  <span className="text-[10px] text-white/30">{step.cost} · {step.timeline}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">验证：{step.validates}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* v3 新增：纸面分析 vs 实物验证对照表 */}
      <div className="glass-card overflow-hidden border border-red-500/20">
        <div className="p-3 border-b border-white/5">
          <h4 className="text-sm text-red-300/80">纸面分析 vs 实物验证（诚实对照）</h4>
          <p className="text-[10px] text-white/30 mt-1">
            以下所有"工程验证"目前都停留在纸面阶段。纸面分析的价值是"证明方向可行"，但不能替代实物验证。
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {verificationStatus.map(item => (
            <div key={item.item} className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70 font-medium">{item.item}</span>
                <div className="flex gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300">纸面✓</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">实物✗</span>
                </div>
              </div>
              <p className="text-[11px] text-white/40"><span className="text-white/50">差距：</span>{item.gap}</p>
              <p className="text-[11px] text-blue-300/50">→ 验证所需：{item.effort}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10 bg-white/[0.02]">
          <p className="text-xs text-white/50">
            <span className="text-white/70">总结：</span>完成所有实物验证需要 ~¥280 硬件 + ~2 周时间。
            这是从"纸上谈兵"到"有据可依"的最小投入。
          </p>
        </div>
      </div>

      {/* 核心反思 */}
      <div className="glass-card p-5 space-y-3 border-l-2 border-yellow-500/30">
        <h4 className="text-sm text-white/70 font-medium">我从这个项目中学到的</h4>
        <div className="text-xs text-white/40 space-y-2">
          <p>
            <span className="text-white/60">1. 硬件产品的本质是"约束下的工程折衷"。</span>
            不是"我想要什么功能"，而是"在这个体积/成本/功耗的约束下，我能做到什么"。
            每一个参数背后都是一个 trade-off 决策。
          </p>
          <p>
            <span className="text-white/60">2. MVP 的价值不在于"展示完整愿景"，而在于"用最低成本验证最大风险"。</span>
            这个项目最大的风险是"触觉引导到底有没有用"——而这恰恰是线上 MVP 无法回答的。
            如果重来一次，我会先花 ¥230 做物理原型验证这个假设，再做线上展示。
          </p>
          <p>
            <span className="text-white/60">3. "拍脑袋的数字"比"没有数字"更危险。</span>
            初版 BOM 写了 ¥56 / 81% 毛利率——这种未经验证的数字会给自己和团队错误的信心。
            不如诚实地写"估算 ¥70-120，需要实际询价确认"。
          </p>
          <p>
            <span className="text-white/60">4. 用户场景的"脏活"才是产品经理的核心价值。</span>
            "充电口朝哪边"这种问题看似琐碎，但它背后是对用户行为的深度理解。
            能回答这些问题的人，才是真正的产品 owner。
          </p>
        </div>
      </div>
    </div>
  )
}
