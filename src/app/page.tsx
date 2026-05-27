'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Cpu, TrendingUp, Play, Square, FlaskConical, Wrench, Sparkles } from 'lucide-react'
import BreathOrb from '@/components/BreathOrb'
import type { SessionStats } from '@/components/BreathOrb'
import PlanGenerator from '@/components/PlanGenerator'
import HardwareSpec from '@/components/HardwareSpec'
import BusinessModel from '@/components/BusinessModel'
import PowerBudget from '@/components/engineering/PowerBudget'
import LatencyChain from '@/components/engineering/LatencyChain'
import MechanicalLayout from '@/components/engineering/MechanicalLayout'
import RealCost from '@/components/engineering/RealCost'
import TechRisks from '@/components/engineering/TechRisks'
import UserScenarios from '@/components/engineering/UserScenarios'
import FirmwareDemo from '@/components/engineering/FirmwareDemo'
import MVPHonesty from '@/components/engineering/MVPHonesty'
import UserResearch from '@/components/engineering/UserResearch'
import type { BreathPlan, BreathPhase } from '@/lib/deepseek'

type Tab = 'experience' | 'hardware' | 'engineering' | 'business' | 'honesty'

// 工程验证页的 section 定义
const engineeringSections = [
  { id: 'power', label: '功耗' },
  { id: 'latency', label: '延迟' },
  { id: 'mechanical', label: '机械' },
  { id: 'cost', label: '成本' },
  { id: 'risks', label: '风险' },
  { id: 'scenarios', label: '场景' },
  { id: 'firmware', label: '固件' },
  { id: 'research', label: '用研' },
]

// 默认呼吸方案（4-7-8法）
const defaultPlan: BreathPlan = {
  name: '经典4-7-8助眠法',
  description: '源自瑜伽调息术，通过延长呼气激活副交感神经',
  totalDuration: 80,
  cycles: 4,
  phases: [
    { type: 'inhale', duration: 4, intensity: 70, pattern: 'ease-in' },
    { type: 'hold', duration: 7, intensity: 30, pattern: 'pulse' },
    { type: 'exhale', duration: 8, intensity: 60, pattern: 'ease-out' },
    { type: 'rest', duration: 1, intensity: 0, pattern: 'linear' },
  ],
  scienceBasis: '延长呼气相可刺激迷走神经，降低心率和皮质醇水平',
  hardwareNote: 'DRV2605L RTP 模式渐强/渐弱，Auto-Resonance 追踪 LRA 谐振频率',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('experience')
  const [currentPlan, setCurrentPlan] = useState<BreathPlan>(defaultPlan)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGenerator, setShowGenerator] = useState(true) // v3: 默认展开
  const [currentPhaseInfo, setCurrentPhaseInfo] = useState<string>('')
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [showSessionEnd, setShowSessionEnd] = useState(false)
  const engineeringRef = useRef<HTMLDivElement>(null)

  const handlePlanGenerated = useCallback((plan: BreathPlan) => {
    setCurrentPlan(plan)
    setShowGenerator(false)
    setIsPlaying(true)
    setShowSessionEnd(false)
    setSessionStats(null)
  }, [])

  const handlePhaseChange = useCallback((phase: BreathPhase) => {
    setCurrentPhaseInfo(`${phase.type} | 强度 ${phase.intensity}%`)
  }, [])

  const handleSessionEnd = useCallback((stats: SessionStats) => {
    if (stats.totalDuration > 3) { // 至少 3 秒才显示 summary
      setSessionStats(stats)
      setShowSessionEnd(true)
    }
  }, [])

  const handleLongPressStart = useCallback(() => {
    setIsPlaying(true)
    setShowSessionEnd(false)
    setSessionStats(null)
  }, [])

  const handleStop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`eng-${sectionId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const tabs: { id: Tab; label: string; shortLabel: string; icon: typeof Moon }[] = [
    { id: 'experience', label: '体验', shortLabel: '体验', icon: Moon },
    { id: 'hardware', label: '硬件', shortLabel: '硬件', icon: Cpu },
    { id: 'engineering', label: '工程验证', shortLabel: '工程', icon: FlaskConical },
    { id: 'business', label: '商业', shortLabel: '商业', icon: TrendingUp },
    { id: 'honesty', label: '反思', shortLabel: '反思', icon: Wrench },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/60 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Moon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 font-medium hidden sm:inline">BreathAnchor</span>
            <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">MVP v3</span>
          </div>
          
          <div className="flex items-center gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-sm">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 内容区 */}
      <div className="pt-14">
        <AnimatePresence mode="wait">
          {/* 体验页 */}
          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12"
            >
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-light text-white/90 mb-3">
                  握住，呼吸，入睡
                </h1>
                <p className="text-white/40 max-w-md mx-auto text-sm">
                  BreathAnchor 用触觉节律引导呼吸——无需看屏幕、无需听声音，
                  闭上眼睛，跟随手心的膨胀与收缩自然入睡
                </p>
              </motion.div>

              {/* 呼吸球 */}
              <BreathOrb
                phases={currentPlan.phases}
                isPlaying={isPlaying}
                onPhaseChange={handlePhaseChange}
                onCycleComplete={() => {}}
                onSessionEnd={handleSessionEnd}
                onLongPressStart={handleLongPressStart}
              />

              {/* 训练结束 Summary */}
              <AnimatePresence>
                {showSessionEnd && sessionStats && !isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 glass-card px-6 py-4 text-center max-w-sm"
                  >
                    <p className="text-sm text-white/70 mb-2">本次训练完成</p>
                    <div className="flex items-center justify-center gap-6 text-center">
                      <div>
                        <p className="text-2xl font-light text-blue-300">{sessionStats.totalCycles}</p>
                        <p className="text-[10px] text-white/30">完整循环</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-2xl font-light text-blue-300">{sessionStats.totalDuration}s</p>
                        <p className="text-[10px] text-white/30">持续时间</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-2xl font-light text-blue-300">{sessionStats.phasesCompleted}</p>
                        <p className="text-[10px] text-white/30">阶段完成</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/20 mt-3">
                      硬件版本会记录 HRV 变化，量化呼吸训练效果
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 控制区 */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isPlaying) {
                        handleStop()
                      } else {
                        setIsPlaying(true)
                        setShowSessionEnd(false)
                        setSessionStats(null)
                      }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      isPlaying
                        ? 'bg-white/10 text-white/80 border border-white/10'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4" />
                        停止
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        开始体验
                      </>
                    )}
                  </motion.button>
                </div>

                {/* 当前方案信息 */}
                <div className="text-center">
                  <p className="text-sm text-white/60">{currentPlan.name}</p>
                  <p className="text-xs text-white/30 mt-1">{currentPlan.scienceBasis}</p>
                  {isPlaying && currentPhaseInfo && (
                    <p className="text-xs text-blue-300/60 mt-1 font-mono">{currentPhaseInfo}</p>
                  )}
                </div>
              </div>

              {/* AI方案生成器 —— v3: 默认展开，更强视觉引导 */}
              <div className="mt-8 w-full max-w-lg mx-auto">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setShowGenerator(!showGenerator)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    showGenerator
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : 'bg-white/5 text-white/50 hover:text-blue-300 border border-white/5 hover:border-blue-500/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {showGenerator ? '收起 AI 方案生成器' : '用 DeepSeek 生成个性化呼吸方案'}
                </motion.button>

                <AnimatePresence>
                  {showGenerator && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <PlanGenerator onPlanGenerated={handlePlanGenerated} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 手机端提示 */}
              <p className="mt-10 text-xs text-white/20 text-center max-w-sm">
                手机端支持 Vibration API 触觉反馈 · 长按球体可直接开始 · 持续振动模拟真实设备
              </p>
            </motion.div>
          )}

          {/* 硬件页 */}
          {activeTab === 'hardware' && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-16"
            >
              <HardwareSpec />
            </motion.div>
          )}

          {/* 工程验证页 */}
          {activeTab === 'engineering' && (
            <motion.div
              key="engineering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-16 space-y-16"
              ref={engineeringRef}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-light text-white/90 mb-2">工程验证</h1>
                <p className="text-sm text-white/40">不是"我想做什么"，而是"在约束下能做到什么"——每个数字都有推导过程</p>
                {/* Section 快速跳转 */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                  {engineeringSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] text-white/40 bg-white/5 hover:bg-white/10 hover:text-white/70 transition-all"
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
              <div id="eng-power"><PowerBudget /></div>
              <div id="eng-latency"><LatencyChain /></div>
              <div id="eng-mechanical"><MechanicalLayout /></div>
              <div id="eng-cost"><RealCost /></div>
              <div id="eng-risks"><TechRisks /></div>
              <div id="eng-scenarios"><UserScenarios /></div>
              <div id="eng-firmware"><FirmwareDemo /></div>
              <div id="eng-research"><UserResearch /></div>
            </motion.div>
          )}

          {/* 商业页 */}
          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-16"
            >
              <BusinessModel />
            </motion.div>
          )}

          {/* 反思页 */}
          {activeTab === 'honesty' && (
            <motion.div
              key="honesty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-16"
            >
              <MVPHonesty />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部信息 */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-xs text-white/20">
          BreathAnchor MVP v3 · Powered by DeepSeek · 硬件产品思维演示
        </p>
        <p className="text-xs text-white/10 mt-1">
          本项目为产品能力展示，非商业产品 · 含工程验证推导过程 · 所有验证均为纸面分析
        </p>
      </footer>
    </main>
  )
}
