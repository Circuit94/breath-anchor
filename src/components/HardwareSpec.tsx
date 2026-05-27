'use client'

import { motion } from 'framer-motion'
import { Cpu, Battery, Bluetooth, Ruler, Weight, Zap } from 'lucide-react'

const specs = [
  { icon: Ruler, label: '尺寸', value: '60×45×25mm', note: '鹅卵石形态' },
  { icon: Weight, label: '重量', value: '38g', note: '无感佩戴' },
  { icon: Cpu, label: '主控', value: 'nRF52840', note: 'BLE 5.0 + 低功耗' },
  { icon: Zap, label: '马达', value: 'LRA线性马达', note: '20ms响应延迟' },
  { icon: Battery, label: '续航', value: '7天', note: '200mAh锂电' },
  { icon: Bluetooth, label: '连接', value: 'BLE 5.0', note: '10m有效距离' },
]

const bomItems = [
  { component: 'nRF52840 SoC', cost: '¥18', supplier: 'Nordic Semi', note: '主控+BLE' },
  { component: 'LRA线性马达 ×2', cost: '¥12', supplier: '金龙机电', note: '双轴触觉' },
  { component: '加速度传感器', cost: '¥3', supplier: 'Bosch BMA400', note: '握持检测' },
  { component: '锂电池 200mAh', cost: '¥8', supplier: 'ATL', note: '7天续航' },
  { component: 'PCB + FPC', cost: '¥5', supplier: '深南电路', note: '4层板' },
  { component: '外壳（液态硅胶）', cost: '¥6', supplier: '比亚迪电子', note: '亲肤材质' },
  { component: '包装 + 配件', cost: '¥4', supplier: '-', note: '充电线+说明书' },
]

const totalBOM = bomItems.reduce((sum, item) => sum + parseInt(item.cost.replace('¥', '')), 0)

export default function HardwareSpec() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* 产品规格 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">硬件规格</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specs.map((spec, i) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 space-y-2"
            >
              <spec.icon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-white/50">{spec.label}</p>
                <p className="text-lg text-white/90 font-medium">{spec.value}</p>
                <p className="text-xs text-white/30">{spec.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BOM成本分析 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-2">BOM 成本分析</h2>
        <p className="text-sm text-white/40 mb-6">基于1万台量产规模估算</p>
        
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-white/50 font-normal">组件</th>
                <th className="text-left p-3 text-white/50 font-normal">成本</th>
                <th className="text-left p-3 text-white/50 font-normal hidden md:table-cell">供应商</th>
                <th className="text-left p-3 text-white/50 font-normal hidden md:table-cell">备注</th>
              </tr>
            </thead>
            <tbody>
              {bomItems.map(item => (
                <tr key={item.component} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white/80">{item.component}</td>
                  <td className="p-3 text-blue-300">{item.cost}</td>
                  <td className="p-3 text-white/40 hidden md:table-cell">{item.supplier}</td>
                  <td className="p-3 text-white/30 hidden md:table-cell">{item.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="p-3 text-white/90 font-medium">BOM 总计</td>
                <td className="p-3 text-blue-300 font-medium">¥{totalBOM}</td>
                <td className="p-3 text-white/40 hidden md:table-cell" colSpan={2}>
                  建议零售价 ¥299 | 毛利率 {Math.round((1 - totalBOM / 299) * 100)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 固件架构 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">固件架构</h2>
        <div className="glass-card p-6 font-mono text-xs text-white/60 space-y-1 overflow-x-auto">
          <p className="text-blue-300">// BreathAnchor Firmware Architecture (Zephyr RTOS)</p>
          <p>&nbsp;</p>
          <p>┌─────────────────────────────────────────────┐</p>
          <p>│  Application Layer                          │</p>
          <p>│  ├── breath_engine.c    // 呼吸节奏引擎     │</p>
          <p>│  ├── haptic_driver.c    // 触觉反馈驱动     │</p>
          <p>│  ├── ble_service.c      // BLE通信服务      │</p>
          <p>│  └── power_mgmt.c       // 电源管理         │</p>
          <p>├─────────────────────────────────────────────┤</p>
          <p>│  Zephyr RTOS Kernel                         │</p>
          <p>│  ├── Thread: haptic_thread (优先级1, 1ms)   │</p>
          <p>│  ├── Thread: ble_thread   (优先级3)         │</p>
          <p>│  └── Thread: sensor_thread (优先级5, 50ms)  │</p>
          <p>├─────────────────────────────────────────────┤</p>
          <p>│  HAL: nRF52840 (PWM, I2C, SPI, ADC)        │</p>
          <p>└─────────────────────────────────────────────┘</p>
        </div>
      </section>

      {/* 关键技术指标 */}
      <section>
        <h2 className="text-2xl font-light text-white/90 mb-6">关键性能指标</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm text-white/60">触觉延迟</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-blue-300">20</span>
              <span className="text-sm text-white/40 pb-1">ms</span>
            </div>
            <p className="text-xs text-white/30">
              从BLE指令接收到马达响应的端到端延迟，低于人体触觉感知阈值（50ms）
            </p>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm text-white/60">振动精度</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-blue-300">256</span>
              <span className="text-sm text-white/40 pb-1">级</span>
            </div>
            <p className="text-xs text-white/30">
              8-bit PWM分辨率，支持从轻触到明显振动的细腻过渡，模拟自然呼吸节律
            </p>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm text-white/60">功耗</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-blue-300">1.2</span>
              <span className="text-sm text-white/40 pb-1">mA 平均</span>
            </div>
            <p className="text-xs text-white/30">
              深度睡眠模式 &lt;5μA，单次训练（10min）约消耗 0.8% 电量
            </p>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm text-white/60">OTA升级</h4>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-light text-blue-300">DFU</span>
              <span className="text-sm text-white/40 pb-1">Secure</span>
            </div>
            <p className="text-xs text-white/30">
              支持安全固件空中升级，新呼吸算法可通过App推送到设备
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
