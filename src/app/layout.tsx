import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BreathAnchor — 触觉呼吸锚点',
  description: '一个握在手心的鹅卵石，用触觉节奏引导你从焦虑切换到放松。无屏幕、无光、纯触觉的睡前减压设备。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-calm-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
