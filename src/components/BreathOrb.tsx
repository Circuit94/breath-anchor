'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BreathPhase } from '@/lib/deepseek'

interface BreathOrbProps {
  phases: BreathPhase[]
  isPlaying: boolean
  onCycleComplete?: () => void
  onPhaseChange?: (phase: BreathPhase, index: number) => void
  onSessionEnd?: (stats: SessionStats) => void
  onLongPressStart?: () => void
}

export interface SessionStats {
  totalCycles: number
  totalDuration: number // seconds
  phasesCompleted: number
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

// 根据 phase pattern 计算 easing 后的 progress
function easedProgress(progress: number, pattern: string): number {
  switch (pattern) {
    case 'ease-in':
      return progress * progress // quadratic ease-in
    case 'ease-out':
      return 1 - (1 - progress) * (1 - progress) // quadratic ease-out
    case 'ease-in-out':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
    case 'pulse':
      return progress // linear for pulse (handled separately)
    default:
      return progress // linear
  }
}

export default function BreathOrb({ phases, isPlaying, onCycleComplete, onPhaseChange, onSessionEnd, onLongPressStart }: BreathOrbProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [timeInPhase, setTimeInPhase] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [totalPhasesCompleted, setTotalPhasesCompleted] = useState(0)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const vibrationSupported = useRef(false)
  const sessionStartRef = useRef<number>(0)

  useEffect(() => {
    vibrationSupported.current = 'vibrate' in navigator
  }, [])

  const currentPhase = phases[currentPhaseIndex]
  const progress = currentPhase ? timeInPhase / currentPhase.duration : 0

  // 持续触觉反馈 —— 贯穿整个 phase，而非仅切换时震一次
  const startContinuousHaptic = useCallback((phase: BreathPhase) => {
    if (!vibrationSupported.current) return
    
    // 清除之前的振动循环
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
    }

    try {
      switch (phase.type) {
        case 'inhale':
          // 每 400ms 一次渐强脉冲，模拟持续膨胀
          vibrationIntervalRef.current = setInterval(() => {
            navigator.vibrate([30, 100, 50, 100, 70])
          }, 400)
          navigator.vibrate([30, 100, 50, 100, 70]) // 立即触发第一次
          break
        case 'hold':
          // 每 800ms 一次轻微脉冲，维持触觉存在感
          vibrationIntervalRef.current = setInterval(() => {
            navigator.vibrate([15, 300, 15])
          }, 800)
          navigator.vibrate([15, 300, 15])
          break
        case 'exhale':
          // 每 500ms 一次渐弱脉冲，模拟收缩
          vibrationIntervalRef.current = setInterval(() => {
            navigator.vibrate([60, 150, 40, 150, 20])
          }, 500)
          navigator.vibrate([60, 150, 40, 150, 20])
          break
        case 'rest':
          navigator.vibrate(0)
          break
      }
    } catch {
      // 静默处理不支持的情况
    }
  }, [])

  const stopHaptic = useCallback(() => {
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current)
      vibrationIntervalRef.current = null
    }
    if (vibrationSupported.current) {
      try { navigator.vibrate(0) } catch {}
    }
  }, [])

  // 长按手势处理
  const handlePointerDown = useCallback(() => {
    if (isPlaying) return // 已在播放时不处理长按
    setIsLongPressing(true)
    longPressTimerRef.current = setTimeout(() => {
      // 长按 600ms 触发
      setIsLongPressing(false)
      onLongPressStart?.()
    }, 600)
  }, [isPlaying, onLongPressStart])

  const handlePointerUp = useCallback(() => {
    setIsLongPressing(false)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  // 用 ref 追踪需要通知父组件的 phase 变化
  const pendingPhaseChange = useRef<{ phase: BreathPhase; index: number } | null>(null)
  const pendingCycleComplete = useRef(false)

  useEffect(() => {
    if (!isPlaying || phases.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      stopHaptic()
      return
    }

    sessionStartRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      setTimeInPhase(prev => {
        const newTime = prev + 0.1
        setTotalElapsed(t => t + 0.1)
        if (newTime >= phases[currentPhaseIndex].duration) {
          setTotalPhasesCompleted(p => p + 1)
          const nextIndex = currentPhaseIndex + 1
          if (nextIndex >= phases.length) {
            setCycleCount(c => c + 1)
            setCurrentPhaseIndex(0)
            startContinuousHaptic(phases[0])
            pendingPhaseChange.current = { phase: phases[0], index: 0 }
            pendingCycleComplete.current = true
          } else {
            setCurrentPhaseIndex(nextIndex)
            startContinuousHaptic(phases[nextIndex])
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
  }, [isPlaying, currentPhaseIndex, phases, startContinuousHaptic, stopHaptic])

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

  // 重置 & 结束回调
  useEffect(() => {
    if (!isPlaying) {
      // 如果之前在播放且有数据，触发结束回调
      if (totalElapsed > 0 && onSessionEnd) {
        onSessionEnd({
          totalCycles: cycleCount,
          totalDuration: Math.round(totalElapsed),
          phasesCompleted: totalPhasesCompleted,
        })
      }
      setCurrentPhaseIndex(0)
      setTimeInPhase(0)
      setCycleCount(0)
      setTotalElapsed(0)
      setTotalPhasesCompleted(0)
      stopHaptic()
    }
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // 初始触觉
  useEffect(() => {
    if (isPlaying && phases.length > 0) {
      startContinuousHaptic(phases[0])
      const timer = setTimeout(() => {
        onPhaseChange?.(phases[0], 0)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, phases, startContinuousHaptic, onPhaseChange])

  // 计算 orb 的视觉状态 —— 使用 easing 曲线而非线性步进
  const getOrbScale = () => {
    if (!currentPhase) return 0.7
    const eased = easedProgress(progress, currentPhase.pattern || 'linear')
    switch (currentPhase.type) {
      case 'inhale': return 0.6 + 0.5 * eased
      case 'hold': return 1.1 + 0.02 * Math.sin(timeInPhase * Math.PI * 2)
      case 'exhale': return 1.1 - 0.5 * eased
      case 'rest': return 0.6
      default: return 0.7
    }
  }

  const getOrbOpacity = () => {
    if (!currentPhase) return 0.5
    const eased = easedProgress(progress, currentPhase.pattern || 'linear')
    switch (currentPhase.type) {
      case 'inhale': return 0.4 + 0.5 * eased
      case 'hold': return 0.9
      case 'exhale': return 0.9 - 0.4 * eased
      case 'rest': return 0.4
      default: return 0.5
    }
  }

  // CSS transition duration 根据 phase 动态调整（更流畅）
  const transitionDuration = currentPhase ? Math.min(currentPhase.duration * 0.15, 0.4) : 0.1

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 主呼吸球体 */}
      <div
        className="relative w-72 h-72 flex items-center justify-center select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* 外圈光晕 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(99, 179, 237, ${getOrbOpacity() * 0.2}) 0%, transparent 70%)`,
          }}
          animate={{ scale: getOrbScale() * 1.3 }}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
        />

        {/* 核心球体 */}
        <motion.div
          className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentPhase ? phaseColors[currentPhase.type] : 'from-blue-400/60 to-cyan-300/40'} ${!isPlaying ? 'cursor-pointer' : ''}`}
          animate={{
            scale: isLongPressing ? 0.55 : getOrbScale(),
            opacity: getOrbOpacity(),
          }}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          style={{
            boxShadow: `
              0 0 ${40 * getOrbOpacity()}px rgba(99, 179, 237, ${getOrbOpacity() * 0.5}),
              0 0 ${80 * getOrbOpacity()}px rgba(49, 130, 206, ${getOrbOpacity() * 0.3}),
              inset 0 0 40px rgba(255, 255, 255, 0.1)
            `,
          }}
        />

        {/* 长按进度环 */}
        {isLongPressing && !isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="w-56 h-56" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke="rgba(99, 179, 237, 0.3)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke="rgba(99, 179, 237, 0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={289}
                initial={{ strokeDashoffset: 289 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.6, ease: 'linear' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
          </motion.div>
        )}

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
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg text-white/40">长按开始</span>
            <span className="text-xs text-white/20 mt-2">或点击下方按钮</span>
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

      {/* 硬件映射说明 */}
      {isPlaying && currentPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card px-4 py-2 text-xs text-white/40 max-w-xs text-center"
        >
          <span className="text-white/60">硬件映射：</span>
          {currentPhase.type === 'inhale' && ' DRV2605L RTP 渐强 → LRA 膨胀感'}
          {currentPhase.type === 'hold' && ` RTP ${currentPhase.intensity}% @2Hz 微脉冲 → 触觉存在感`}
          {currentPhase.type === 'exhale' && ' RTP 渐弱 + Active Braking → 收缩感'}
          {currentPhase.type === 'rest' && ' Standby 模式 → 完全静止'}
        </motion.div>
      )}
    </div>
  )
}
