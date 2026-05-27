'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BreathPhase } from '@/lib/deepseek'

interface BreathOrbProps {
  phases: BreathPhase[]
  isPlaying: boolean
  onCycleComplete?: () => void
  onPhaseChange?: (phase: BreathPhase, index: number) => void
}

const phaseLabels: Record<string, string> = {
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
  rest: '休息',
}

const phaseColors: Record<string, string> = {
  inhale: 'from-blue-400/80 to-cyan-300/60',
  hold: 'from-indigo-400/60 to-blue-300/40',
  exhale: 'from-blue-500/60 to-slate-400/40',
  rest: 'from-slate-500/40 to-slate-600/20',
}

export default function BreathOrb({ phases, isPlaying, onCycleComplete, onPhaseChange }: BreathOrbProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [timeInPhase, setTimeInPhase] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const vibrationSupported = useRef(false)

  useEffect(() => {
    vibrationSupported.current = 'vibrate' in navigator
  }, [])

  const currentPhase = phases[currentPhaseIndex]
  const progress = currentPhase ? timeInPhase / currentPhase.duration : 0

  // 触觉反馈（手机端）
  const triggerHaptic = useCallback((phase: BreathPhase) => {
    if (!vibrationSupported.current) return
    
    try {
      switch (phase.type) {
        case 'inhale':
          // 渐强振动模拟膨胀
          navigator.vibrate([50, 30, 80, 30, 120])
          break
        case 'hold':
          // 轻微脉冲
          navigator.vibrate([20, 200, 20, 200, 20])
          break
        case 'exhale':
          // 渐弱振动模拟收缩
          navigator.vibrate([120, 30, 80, 30, 50])
          break
        case 'rest':
          navigator.vibrate(0)
          break
      }
    } catch {
      // 静默处理不支持的情况
    }
  }, [])

  // 用 ref 追踪需要通知父组件的 phase 变化，避免在 setState updater 中调用父组件 setState
  const pendingPhaseChange = useRef<{ phase: BreathPhase; index: number } | null>(null)
  const pendingCycleComplete = useRef(false)

  useEffect(() => {
    if (!isPlaying || phases.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeInPhase(prev => {
        const newTime = prev + 0.1
        if (newTime >= phases[currentPhaseIndex].duration) {
          // 进入下一阶段
          const nextIndex = currentPhaseIndex + 1
          if (nextIndex >= phases.length) {
            // 一个循环完成
            setCycleCount(c => c + 1)
            setCurrentPhaseIndex(0)
            triggerHaptic(phases[0])
            pendingPhaseChange.current = { phase: phases[0], index: 0 }
            pendingCycleComplete.current = true
          } else {
            setCurrentPhaseIndex(nextIndex)
            triggerHaptic(phases[nextIndex])
            pendingPhaseChange.current = { phase: phases[nextIndex], index: nextIndex }
          }
          return 0
        }
        return newTime
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, currentPhaseIndex, phases, triggerHaptic])

  // 在渲染后安全地通知父组件
  useEffect(() => {
    if (pendingPhaseChange.current) {
      const { phase, index } = pendingPhaseChange.current
      pendingPhaseChange.current = null
      onPhaseChange?.(phase, index)
    }
    if (pendingCycleComplete.current) {
      pendingCycleComplete.current = false
      onCycleComplete?.()
    }
  })

  // 重置
  useEffect(() => {
    if (!isPlaying) {
      setCurrentPhaseIndex(0)
      setTimeInPhase(0)
      setCycleCount(0)
    }
  }, [isPlaying])

  // 初始触觉（延迟到下一帧，避免渲染期间更新父组件）
  useEffect(() => {
    if (isPlaying && phases.length > 0) {
      triggerHaptic(phases[0])
      const timer = setTimeout(() => {
        onPhaseChange?.(phases[0], 0)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, phases, triggerHaptic, onPhaseChange])

  // 计算orb的视觉状态
  const getOrbScale = () => {
    if (!currentPhase) return 0.7
    switch (currentPhase.type) {
      case 'inhale': return 0.6 + 0.5 * progress
      case 'hold': return 1.1 + 0.02 * Math.sin(timeInPhase * Math.PI * 2)
      case 'exhale': return 1.1 - 0.5 * progress
      case 'rest': return 0.6
      default: return 0.7
    }
  }

  const getOrbOpacity = () => {
    if (!currentPhase) return 0.5
    switch (currentPhase.type) {
      case 'inhale': return 0.4 + 0.5 * progress
      case 'hold': return 0.9
      case 'exhale': return 0.9 - 0.4 * progress
      case 'rest': return 0.4
      default: return 0.5
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 主呼吸球体 */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* 外圈光晕 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(99, 179, 237, ${getOrbOpacity() * 0.2}) 0%, transparent 70%)`,
          }}
          animate={{ scale: getOrbScale() * 1.3 }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />

        {/* 核心球体 */}
        <motion.div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentPhase ? phaseColors[currentPhase.type] : 'from-blue-400/60 to-cyan-300/40'}`}
          animate={{
            scale: getOrbScale(),
            opacity: getOrbOpacity(),
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            boxShadow: `
              0 0 ${40 * getOrbOpacity()}px rgba(99, 179, 237, ${getOrbOpacity() * 0.5}),
              0 0 ${80 * getOrbOpacity()}px rgba(49, 130, 206, ${getOrbOpacity() * 0.3}),
              inset 0 0 40px rgba(255, 255, 255, 0.1)
            `,
          }}
        />

        {/* 中心文字 */}
        <AnimatePresence mode="wait">
          {isPlaying && currentPhase && (
            <motion.div
              key={currentPhase.type + currentPhaseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span className="text-2xl font-light text-white/90">
                {phaseLabels[currentPhase.type]}
              </span>
              <span className="text-sm text-white/50 mt-1">
                {Math.ceil(currentPhase.duration - timeInPhase)}s
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 未播放时的提示 */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg text-white/40">握住开始</span>
            <span className="text-xs text-white/20 mt-2">模拟触觉体验</span>
          </div>
        )}
      </div>

      {/* 进度指示器 */}
      {isPlaying && (
        <div className="flex items-center gap-2">
          {phases.map((phase, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPhaseIndex
                  ? 'w-8 bg-blue-400'
                  : i < currentPhaseIndex
                  ? 'w-3 bg-blue-400/40'
                  : 'w-3 bg-white/10'
              }`}
            />
          ))}
          <span className="text-xs text-white/30 ml-3">
            第 {cycleCount + 1} 轮
          </span>
        </div>
      )}

      {/* 硬件映射说明（体现产品思维） */}
      {isPlaying && currentPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card px-4 py-2 text-xs text-white/40 max-w-xs text-center"
        >
          <span className="text-white/60">硬件映射：</span>
          {currentPhase.type === 'inhale' && ' 线性马达渐强振动 → 模拟设备膨胀'}
          {currentPhase.type === 'hold' && ` 微脉冲 ${currentPhase.intensity}% @2Hz → 维持触觉存在感`}
          {currentPhase.type === 'exhale' && ' 线性马达渐弱 → 模拟设备收缩'}
          {currentPhase.type === 'rest' && ' 马达静止 → 完全安静'}
        </motion.div>
      )}
    </div>
  )
}
