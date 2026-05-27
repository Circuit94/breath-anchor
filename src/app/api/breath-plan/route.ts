import { NextRequest, NextResponse } from 'next/server'
import { generateBreathPlan, type BreathPlanRequest } from '@/lib/deepseek'

export async function POST(request: NextRequest) {
  try {
    const body: BreathPlanRequest = await request.json()

    // 参数校验
    if (!body.scenario || !body.intensity || !body.duration) {
      return NextResponse.json(
        { error: '缺少必要参数：scenario, intensity, duration' },
        { status: 400 }
      )
    }

    if (body.intensity < 1 || body.intensity > 10) {
      return NextResponse.json(
        { error: 'intensity 必须在 1-10 之间' },
        { status: 400 }
      )
    }

    const plan = await generateBreathPlan(body)

    return NextResponse.json({
      success: true,
      plan,
      meta: {
        generatedAt: new Date().toISOString(),
        model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'fallback-default',
        hardwareCompatible: true,
        firmwareVersion: '0.1.0-alpha',
      }
    })
  } catch (error) {
    console.error('Breath plan generation error:', error)
    return NextResponse.json(
      { error: '方案生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
