'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import type { BreathPlan } from '@/lib/deepseek'

interface PlanGeneratorProps {
  onPlanGenerated: (plan: BreathPlan) => void
}

const scenarios = [
  { label: '加班后失眠', value: '深夜加班结束后躺在床上大脑仍在高速运转，无法入睡' },
  { label: '面试前焦虑', value: '明天有重要面试，紧张到心跳加速、手心出汗' },
  { label: '社交疲惫', value: '参加了一整天的社交活动，精神极度疲惫但身体亢奋' },
  { label: '深夜emo', value: '深夜独处时突然涌上来的焦虑和不安感' },
  { label: '考试压力', value: '考试周复习压力大，注意力涣散，需要快速恢复' },
]

export default function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
  const [scenario, setScenario] = useState('')
  const [customScenario, setCustomScenario] = useState('')
  const [intensity, setIntensity] = useState(6)
  const [duration, setDuration] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    const finalScenario = customScenario || scenario
    if (!finalScenario) {
      setError('请选择或描述你的场景')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/breath-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: finalScenario,
          intensity,
          duration,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onPlanGenerated(data.plan)
      } else {
        setError(data.error || '生成失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 max-w-lg w-full space-y-6">
      <div className="flex items-center gap-2 text-blue-300">
        <Sparkles className="w-5 h-5" />
        <h3 className="text-lg font-medium">AI 个性化方案</h3>
      </div>

      {/* 场景选择 */}
      <div className="space-y-3">
        <label className="text-sm text-white/60">你现在的状态</label>
        <div className="flex flex-wrap gap-2">
          {scenarios.map(s => (
            <button
              key={s.label}
              onClick={() => { setScenario(s.value); setCustomScenario('') }}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                scenario === s.value
                  ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                  : 'border-white/10 text-white/50 hover:border-white/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="或者描述你的具体场景..."
          value={customScenario}
          onChange={e => { setCustomScenario(e.target.value); setScenario('') }}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50"
        />
      </div>

      {/* 焦虑程度 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-white/60">焦虑程度</label>
          <span className="text-sm text-blue-300">{intensity}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>轻微不安</span>
          <span>极度焦虑</span>
        </div>
      </div>

      {/* 时长选择 */}
      <div className="space-y-3">
        <label className="text-sm text-white/60">训练时长</label>
        <div className="flex gap-2">
          {[3, 5, 8, 10].map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                duration === d
                  ? 'border-blue-400 bg-blue-400/10 text-blue-300'
                  : 'border-white/10 text-white/50 hover:border-white/30'
              }`}
            >
              {d}分钟
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            DeepSeek 正在设计方案...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            生成我的呼吸方案
          </>
        )}
      </motion.button>

      {/* 产品思维注释 */}
      <p className="text-xs text-white/20 text-center">
        实际硬件版本中，AI方案将通过BLE推送到设备固件，转化为精确的PWM振动序列
      </p>
    </div>
  )
}
