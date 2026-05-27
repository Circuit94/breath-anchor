# BreathAnchor 🌊

> 握住，呼吸，入睡 —— 触觉呼吸引导设备的线上 MVP

BreathAnchor 是一个鹅卵石大小的触觉呼吸引导设备概念产品。通过膨胀/收缩的物理节律引导用户呼吸，无需看屏幕、无需听声音，闭眼即可跟随手心的触觉反馈自然入睡。

本仓库是其**线上 MVP 版本**，用 Web 技术模拟硬件触觉体验，同时展示完整的硬件产品思维和商业化逻辑。

## ✨ 核心功能

- **触觉呼吸模拟**：Framer Motion 动画 + Web Vibration API（手机端真实振动）
- **AI 个性化方案**：基于 DeepSeek 大模型，根据用户场景实时生成呼吸训练方案
- **硬件规格展示**：BOM 成本分析、固件架构、关键性能指标
- **商业模式论证**：TAM/SAM/SOM、竞品差异化、产品路线图

## 🛠 技术栈

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Framer Motion
- DeepSeek API（AI 呼吸方案生成）
- Web Vibration API（移动端触觉反馈）

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量（可选，不配置也能运行默认方案）
cp .env.example .env.local
# 编辑 .env.local 填入你的 DeepSeek API Key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 查看效果。

> 💡 推荐在手机浏览器上访问，可体验 Vibration API 触觉反馈。

## 📁 项目结构

```
breath-anchor/
├── src/
│   ├── app/
│   │   ├── api/breath-plan/route.ts   # AI方案生成API
│   │   ├── globals.css                # 全局样式
│   │   ├── layout.tsx                 # 根布局
│   │   └── page.tsx                   # 主页面（三Tab切换）
│   ├── components/
│   │   ├── BreathOrb.tsx              # 核心呼吸球动画组件
│   │   ├── PlanGenerator.tsx          # AI方案生成表单
│   │   ├── HardwareSpec.tsx           # 硬件规格展示
│   │   └── BusinessModel.tsx          # 商业模式展示
│   └── lib/
│       └── deepseek.ts                # DeepSeek API封装
├── tailwind.config.ts
├── package.json
└── README.md
```

## 🎯 产品亮点

| 维度 | 说明 |
|------|------|
| 交互创新 | 触觉引导（闭眼可用），区别于视觉/音频方案 |
| AI 驱动 | DeepSeek 实时生成个性化呼吸方案 |
| 硬件思维 | 完整 BOM、固件架构、性能指标 |
| 商业闭环 | 硬件+订阅+企业版三条收入流 |
| 数据验证 | TAM ¥420亿 → SOM ¥2.1亿 |

## 📐 硬件设计概要

- **尺寸**：60×45×25mm（鹅卵石形态）
- **主控**：nRF52840（BLE 5.0 + 低功耗）
- **马达**：LRA 线性马达 ×2（20ms 响应）
- **续航**：7 天（200mAh 锂电）
- **BOM 成本**：¥56 | 零售价 ¥299 | 毛利率 81%

## 📄 License

MIT
