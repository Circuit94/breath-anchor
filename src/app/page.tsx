'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Cpu, TrendingUp, Play, Square, FlaskConical, Wrench, Hammer, Search } from 'lucide-react'
import BreathOrb from '@/components/BreathOrb'
import type { SessionStats } from '@/components/BreathOrb'
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
import DirtyPrototype from '@/components/engineering/DirtyPrototype'
import CompetitorTeardown from '@/components/engineering/CompetitorTeardown'
import type { BreathPlan, BreathPhase } from '@/lib/deepseek'

type Tab = 'experience' | 'hardware' | 'engineering' | 'prototype' | 'business' | 'honesty'

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
  { id: 'competitor', label: '竞品' },
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
  const [currentPlan] = useState<BreathPlan>(defaultPlan)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPhaseInfo, setCurrentPhaseInfo] = useState<string>('')
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [showSessionEnd, setShowSessionEnd] = useState(false)
  const engineeringRef = useRef<HTMLDivElement>(null)

  const handlePhaseChange = useCallback((phase: BreathPhase) => {
    setCurrentPhaseInfo(`${phase.type} | 强度 ${phase.intensity}%`)
  }, [])

  const handleSessionEnd = useCallback((stats: SessionStats) => {
    if (stats.totalDuration > 3) {
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
    { id: 'prototype', label: '原型计划', shortLabel: '原型', icon: Hammer },
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
            <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">MVP v4</span>
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
          {/* 体验页 —— v4: 3秒传达价值，让人"感受"而非"分析" */}
          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-12"
            >
              {/* Hero —— 产品概念：3秒内传达 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                {/* 产品概念视觉 */}
                <div className="mb-6 relative">
                  <div className="w-32 h-32 mx-auto relative">
                    {/* 鹅卵石形态示意 */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-full rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700 shadow-2xl shadow-blue-500/10 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-blue-400/60 mx-auto mb-1 animate-pulse" />
                        <span className="text-[9px] text-white/40">65×48×28mm</span>
                      </div>
                    </motion.div>
                    {/* 触觉波纹 */}
                    <motion.div
                      animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-[40%_60%_55%_45%/50%_45%_55%_50%] border border-blue-400/30"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 mt-3">产品概念形态（实际需 3D 渲染图替换）</p>
                </div>

                <h1 className="text-3xl md:text-4xl font-light text-white/90 mb-3">
                  握住，呼吸，入睡
                </h1>
                <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
                  一颗鹅卵石大小的触觉设备。它在你手心膨胀收缩，
                  引导你的呼吸节奏——无需看屏幕、无需听声音，闭上眼睛就好。
                </p>

                {/* 核心价值主张 —— 3个关键词 */}
                <div className="flex items-center justify-center gap-4 mt-5">
                  <div className="text-center">
                    <p className="text-lg text-blue-300">触觉</p>
                    <p className="text-[10px] text-white/30">不用看不用听</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg text-blue-300">45g</p>
                    <p className="text-[10px] text-white/30">鹅卵石握感</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg text-blue-300">¥299</p>
                    <p className="text-[10px] text-white/30">目标售价</p>
                  </div>
                </div>
              </motion.div>

              {/* 呼吸球 —— 核心交互体验 */}
              <div className="mt-4">
                <BreathOrb
                  phases={currentPlan.phases}
                  isPlaying={isPlaying}
                  onPhaseChange={handlePhaseChange}
                  onCycleComplete={() => {}}
                  onSessionEnd={handleSessionEnd}
                  onLongPressStart={handleLongPressStart}
                />
              </div>

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
                        体验触觉呼吸引导
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

              {/* 手机端提示 + 诚实说明 */}
              <div className="mt-10 text-center max-w-sm space-y-2">
                <p className="text-xs text-white/30">
                  手机端支持 Vibration API 触觉反馈 · 长按球体可直接开始
                </p>
                <p className="text-[10px] text-white/15">
                  注意：手机振动 ≠ 产品级 LRA 触觉。真实体验需要物理原型验证。
                  这里展示的是交互逻辑和呼吸节奏设计，不是最终触觉效果。
                </p>
              </div>
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
                <p className="text-[10px] text-red-300/50 mt-1">⚠️ 以下均为纸面分析，实物验证见"原型计划"页</p>
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
              <div id="eng-competitor"><CompetitorTeardown /></div>
            </motion.div>
          )}

          {/* 原型计划页 —— v4 新增 */}
          {activeTab === 'prototype' && (
            <motion.div
              key="prototype"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-16 space-y-16"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-light text-white/90 mb-2">Dirty Prototype</h1>
                <p className="text-sm text-white/40">
                  不是"我分析了什么"，而是"我下周就能做出什么"
                </p>
                <p className="text-xs text-orange-300/60 mt-2">
                  ¥230 + 一个周末 = 能握在手里的物理原型
                </p>
              </div>
              <DirtyPrototype />
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
          BreathAnchor MVP v4 · 硬件产品思维演示 · 触觉呼吸引导设备
        </p>
        <p className="text-xs text-white/10 mt-1">
          本项目为产品能力展示 · 工程验证均为纸面分析 · 下一步：¥230 物理原型验证核心假设
        </p>
      </footer>
    </main>
  )
}
