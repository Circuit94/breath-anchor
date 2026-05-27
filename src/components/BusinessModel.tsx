'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Repeat, Target, ShoppingBag, Brain } from 'lucide-react'

const revenueStreams = [
  {
    icon: ShoppingBag,
    title: '硬件销售',
    price: '¥299',
    desc: '设备一次性购买，含基础呼吸方案库',
    margin: '81%',
  },
  {
    icon: Brain,
    title: 'AI订阅',
    price: '¥19.9/月',
    desc: 'DeepSeek个性化方案 + 睡眠数据分析',
    margin: '90%',
  },
  {
    icon: Repeat,
    title: '企业版',
    price: '¥99/人/年',
    desc: '员工心理健康福利，含管理后台',
    margin: '85%',
  },
]

const metrics = [
  { label: 'TAM', value: '¥420亿', desc: '中国睡眠经济市场（2024）' },
  { label: 'SAM', value: '¥35亿', desc: '智能助眠硬件细分' },
  { label: 'SOM', value: '¥2.1亿', desc: '年轻白领触觉助眠（Y1-Y3）' },
]

const milestones = [
  { phase: 'MVP', time: '0-3月', goal: '线上验证 + 100名种子用户', status: 'current' },
  { phase: '众筹', time: '4-6月', goal: '小米有品/京东众筹 1000台', status: 'next' },
  { phase: '量产', time: '7-12月', goal: '首批5000台 + 渠道铺设', status: 'future' },
  { phase: '增长', time: 'Y2', goal: '企业版 + 海外（Kickstarter）', status: 'future' },
]

export default function BusinessModel() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* 商业模式 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">商业模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {revenueStreams.map((stream, i) => (
            <motion.div
              key={stream.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-5 space-y-3"
            >
              <stream.icon className="w-6 h-6 text-blue-400" />
              <div>
                <h4 className="text-white/90 font-medium">{stream.title}</h4>
                <p className="text-2xl text-blue-300 font-light mt-1">{stream.price}</p>
              </div>
              <p className="text-sm text-white/40">{stream.desc}</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400">毛利率 {stream.margin}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 市场规模 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">市场机会</h2>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 text-center space-y-2"
            >
              <p className="text-xs text-white/40">{m.label}</p>
              <p className="text-2xl md:text-3xl font-light text-blue-300">{m.value}</p>
              <p className="text-xs text-white/30">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 竞品差异化 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">竞品差异化</h2>
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-white/50 font-normal">维度</th>
                <th className="text-left p-2 text-white/50 font-normal">BreathAnchor</th>
                <th className="text-left p-2 text-white/50 font-normal">Dodow</th>
                <th className="text-left p-2 text-white/50 font-normal">Calm App</th>
              </tr>
            </thead>
            <tbody className="text-white/60">
              <tr className="border-b border-white/5">
                <td className="p-2">交互方式</td>
                <td className="p-2 text-blue-300">触觉（闭眼可用）</td>
                <td className="p-2">视觉光圈</td>
                <td className="p-2">音频引导</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-2">个性化</td>
                <td className="p-2 text-blue-300">AI实时生成</td>
                <td className="p-2">固定模式</td>
                <td className="p-2">人工录制</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-2">使用场景</td>
                <td className="p-2 text-blue-300">随时随地</td>
                <td className="p-2">仅卧室</td>
                <td className="p-2">需耳机</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-2">数据闭环</td>
                <td className="p-2 text-blue-300">握持力+心率→AI优化</td>
                <td className="p-2">无</td>
                <td className="p-2">主观评分</td>
              </tr>
              <tr>
                <td className="p-2">价格</td>
                <td className="p-2 text-blue-300">¥299 + ¥19.9/月</td>
                <td className="p-2">¥349</td>
                <td className="p-2">¥398/年</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 路线图 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">产品路线图</h2>
        <div className="space-y-4">
          {milestones.map((ms, i) => (
            <motion.div
              key={ms.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                ms.status === 'current' ? 'bg-blue-400 ring-4 ring-blue-400/20' :
                ms.status === 'next' ? 'bg-white/40' : 'bg-white/10'
              }`} />
              <div className="glass-card p-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-blue-300 font-medium">{ms.phase}</span>
                  <span className="text-xs text-white/30">{ms.time}</span>
                  {ms.status === 'current' && (
                    <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full">
                      当前阶段
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 mt-1">{ms.goal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 用户画像 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">目标用户</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h4 className="text-white/80">核心用户</h4>
            </div>
            <p className="text-sm text-white/50">
              22-35岁城市白领，有睡眠焦虑但不愿吃药，追求科技感解决方案。
              月收入8K-25K，愿意为健康付费但对价格敏感。
            </p>
          </div>
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-white/80">扩展场景</h4>
            </div>
            <p className="text-sm text-white/50">
              企业HR采购（员工福利）、心理咨询师辅助工具、
              考研/考公备考群体、产后焦虑妈妈群体。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
