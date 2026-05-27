export interface BreathPlanRequest {
  scenario: string       // 用户当前场景：如"加班后失眠"、"面试前焦虑"
  intensity: number      // 焦虑程度 1-10
  duration: number       // 期望训练时长（分钟）
  preferences?: string   // 偏好：如"喜欢慢节奏"
}

export interface BreathPhase {
  type: 'inhale' | 'hold' | 'exhale' | 'rest'
  duration: number       // 秒
  intensity: number      // 振动强度 0-100（映射到硬件PWM）
  pattern: 'linear' | 'ease-in' | 'ease-out' | 'pulse'
}

export interface BreathPlan {
  name: string
  description: string
  totalDuration: number  // 总时长（秒）
  cycles: number
  phases: BreathPhase[]
  scienceBasis: string   // 科学依据
  hardwareNote: string   // 硬件实现说明
}

const SYSTEM_PROMPT = `你是 BreathAnchor 的 AI 呼吸方案设计师。BreathAnchor 是一个握在手心的鹅卵石大小的触觉呼吸引导设备，通过膨胀/收缩的物理节奏引导用户呼吸。

你的任务是根据用户的场景和状态，设计个性化的呼吸训练方案。

设计原则：
1. 基于循证医学：4-7-8呼吸法（激活副交感神经）、箱式呼吸（军事级压力管理）、共振呼吸（5.5次/分钟的HRV优化频率）
2. 渐进式设计：前30秒用较快节奏"接住"用户当前的呼吸频率，然后逐渐减慢到目标频率
3. 触觉映射：inhale=设备膨胀（线性马达渐强），hold=轻微脉冲维持存在感，exhale=设备收缩（渐弱），rest=完全静止
4. 考虑硬件约束：线性马达响应时间约20ms，最大振幅受限于设备尺寸（鹅卵石大小，约60mm×45mm×25mm）

输出格式为严格的JSON，包含以下字段：
- name: 方案名称（简短有诗意）
- description: 一句话描述
- totalDuration: 总时长（秒）
- cycles: 循环次数
- phases: 呼吸阶段数组，每个阶段包含 type/duration/intensity/pattern
- scienceBasis: 简短的科学依据（1-2句话）
- hardwareNote: 硬件实现要点（体现产品思维）

只输出JSON，不要其他文字。`

export async function generateBreathPlan(request: BreathPlanRequest): Promise<BreathPlan> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  
  if (!apiKey) {
    // 无API Key时返回默认方案
    return getDefaultPlan(request)
  }

  const userPrompt = `用户场景：${request.scenario}
焦虑程度：${request.intensity}/10
期望时长：${request.duration}分钟
${request.preferences ? `偏好：${request.preferences}` : ''}`

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    // 提取JSON（处理可能的markdown代码块包裹）
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }
    
    return JSON.parse(jsonMatch[0]) as BreathPlan
  } catch (error) {
    console.error('DeepSeek API call failed:', error)
    return getDefaultPlan(request)
  }
}

function getDefaultPlan(request: BreathPlanRequest): BreathPlan {
  const isHighAnxiety = request.intensity >= 7
  const cycleDuration = isHighAnxiety ? 15 : 19 // 4-4-7 vs 4-7-8
  const cycles = Math.floor((request.duration * 60) / cycleDuration)

  return {
    name: isHighAnxiety ? '急速锚定' : '深海潮汐',
    description: isHighAnxiety 
      ? '快速将呼吸频率从焦虑状态拉回安全区间' 
      : '模拟海浪节奏，渐进式引导进入深度放松',
    totalDuration: cycles * cycleDuration,
    cycles,
    phases: isHighAnxiety 
      ? [
          { type: 'inhale', duration: 4, intensity: 80, pattern: 'ease-in' },
          { type: 'hold', duration: 4, intensity: 30, pattern: 'pulse' },
          { type: 'exhale', duration: 7, intensity: 60, pattern: 'ease-out' },
        ]
      : [
          { type: 'inhale', duration: 4, intensity: 70, pattern: 'linear' },
          { type: 'hold', duration: 7, intensity: 20, pattern: 'pulse' },
          { type: 'exhale', duration: 8, intensity: 50, pattern: 'ease-out' },
        ],
    scienceBasis: isHighAnxiety 
      ? '基于箱式呼吸变体，缩短屏息时间降低初始门槛，延长呼气激活迷走神经。' 
      : '经典4-7-8呼吸法，由Andrew Weil博士提出，通过延长呼气相激活副交感神经系统。',
    hardwareNote: isHighAnxiety 
      ? '高焦虑状态下振动强度提升至80%，确保用户在心跳加速时仍能清晰感知设备节奏。' 
      : '标准模式下振动强度适中，hold阶段使用微脉冲（20%强度、2Hz频率）维持触觉存在感而不打断放松。',
  }
}
