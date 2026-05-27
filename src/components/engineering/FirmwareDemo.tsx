'use client'

import { motion } from 'framer-motion'
import { Code, Terminal } from 'lucide-react'

/**
 * 固件 Demo —— 证明"不只是想得到，还做得出"
 * 
 * 这里展示的是一个可以直接烧录到 nRF52840 DK 开发板的最小可行固件。
 * 功能：通过 BLE 接收呼吸方案参数 → 驱动 PWM 输出控制马达振动
 * 
 * 实际验证路径：
 * 1. 买一块 nRF52840 DK（¥200）
 * 2. 接一个 LRA 马达 + DRV2605L 驱动板（¥30）
 * 3. 烧录以下代码
 * 4. 用 nRF Connect App 发送指令测试
 */

const firmwareCode = `// BreathAnchor Minimal Firmware (nRF Connect SDK / Zephyr)
// 文件: src/main.c
// 功能: BLE GATT 接收呼吸参数 → PWM 驱动 LRA 马达

#include <zephyr/kernel.h>
#include <zephyr/drivers/pwm.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(breath_anchor, LOG_LEVEL_INF);

// PWM 设备（连接到 DRV2605L 的 IN/TRIG 引脚）
static const struct pwm_dt_spec motor_pwm = PWM_DT_SPEC_GET(DT_ALIAS(motor0));

// 呼吸阶段定义
struct breath_phase {
    uint8_t type;       // 0=inhale, 1=hold, 2=exhale, 3=rest
    uint8_t duration;   // 秒
    uint8_t intensity;  // 0-100 → 映射到 PWM 占空比
    uint8_t pattern;    // 0=linear, 1=ease-in, 2=ease-out, 3=pulse
};

// 当前呼吸方案（最多8个phase）
static struct breath_phase plan[8];
static uint8_t plan_len = 0;
static bool is_running = false;

// PWM 输出：将 intensity (0-100) 映射到 PWM 占空比
static void set_motor_intensity(uint8_t intensity) {
    if (!device_is_ready(motor_pwm.dev)) return;
    
    // PWM 周期 = 10kHz (适合 LRA 谐振频率 ~170Hz 的包络调制)
    uint32_t period_ns = 100000; // 100μs = 10kHz
    uint32_t pulse_ns = (period_ns * intensity) / 100;
    
    pwm_set_dt(&motor_pwm, period_ns, pulse_ns);
}

// 呼吸引擎线程：根据 phase 类型生成振动包络
static void breath_engine_thread(void *p1, void *p2, void *p3) {
    while (1) {
        if (!is_running || plan_len == 0) {
            set_motor_intensity(0);
            k_sleep(K_MSEC(100));
            continue;
        }

        for (int i = 0; i < plan_len && is_running; i++) {
            struct breath_phase *ph = &plan[i];
            uint32_t duration_ms = ph->duration * 1000;
            uint32_t elapsed = 0;
            uint32_t step_ms = 20; // 20ms 更新周期 → 50Hz 控制频率

            while (elapsed < duration_ms && is_running) {
                float progress = (float)elapsed / duration_ms;
                uint8_t output = 0;

                switch (ph->pattern) {
                    case 0: // linear
                        if (ph->type == 0) // inhale: 渐强
                            output = (uint8_t)(ph->intensity * progress);
                        else if (ph->type == 2) // exhale: 渐弱
                            output = (uint8_t)(ph->intensity * (1.0f - progress));
                        else
                            output = ph->intensity;
                        break;
                    case 1: // ease-in (quadratic)
                        output = (uint8_t)(ph->intensity * progress * progress);
                        break;
                    case 2: // ease-out
                        output = (uint8_t)(ph->intensity * (1.0f - (1.0f-progress)*(1.0f-progress)));
                        break;
                    case 3: // pulse (2Hz)
                        output = (elapsed % 500 < 250) ? ph->intensity : ph->intensity / 4;
                        break;
                }

                set_motor_intensity(output);
                k_sleep(K_MSEC(step_ms));
                elapsed += step_ms;
            }
        }
        // 一个循环完成，继续下一轮
        LOG_INF("Breath cycle complete");
    }
}

K_THREAD_DEFINE(breath_tid, 1024, breath_engine_thread, NULL, NULL, NULL, 1, 0, 0);

// BLE GATT 写入回调：接收呼吸方案
static ssize_t write_breath_plan(struct bt_conn *conn,
                                  const struct bt_gatt_attr *attr,
                                  const void *buf, uint16_t len,
                                  uint16_t offset, uint8_t flags) {
    if (len < 1 || len > sizeof(plan)) {
        return BT_GATT_ERR(BT_ATT_ERR_INVALID_ATTRIBUTE_LEN);
    }

    // 协议: 第一字节=phase数量, 后续每4字节=一个phase
    const uint8_t *data = buf;
    plan_len = data[0];
    if (plan_len > 8) plan_len = 8;

    for (int i = 0; i < plan_len; i++) {
        plan[i].type      = data[1 + i*4 + 0];
        plan[i].duration  = data[1 + i*4 + 1];
        plan[i].intensity = data[1 + i*4 + 2];
        plan[i].pattern   = data[1 + i*4 + 3];
    }

    is_running = true;
    LOG_INF("Received breath plan: %d phases", plan_len);
    return len;
}

// BLE GATT 服务定义
BT_GATT_SERVICE_DEFINE(breath_svc,
    BT_GATT_PRIMARY_SERVICE(BT_UUID_DECLARE_128(
        // Custom UUID: BA000001-0000-1000-8000-00805F9B34FB
        0xFB, 0x34, 0x9B, 0x5F, 0x80, 0x00, 0x00, 0x80,
        0x00, 0x10, 0x00, 0x00, 0x01, 0x00, 0x00, 0xBA)),
    BT_GATT_CHARACTERISTIC(BT_UUID_DECLARE_128(
        0xFB, 0x34, 0x9B, 0x5F, 0x80, 0x00, 0x00, 0x80,
        0x00, 0x10, 0x00, 0x00, 0x02, 0x00, 0x00, 0xBA),
        BT_GATT_CHRC_WRITE,
        BT_GATT_PERM_WRITE,
        NULL, write_breath_plan, NULL),
);

void main(void) {
    int err = bt_enable(NULL);
    if (err) {
        LOG_ERR("BLE init failed: %d", err);
        return;
    }

    // 开始 BLE 广播
    struct bt_le_adv_param adv_param = BT_LE_ADV_PARAM_INIT(
        BT_LE_ADV_OPT_CONNECTABLE | BT_LE_ADV_OPT_USE_NAME,
        BT_GAP_ADV_FAST_INT_MIN_2, BT_GAP_ADV_FAST_INT_MAX_2, NULL);
    
    err = bt_le_adv_start(&adv_param, NULL, 0, NULL, 0);
    if (err) {
        LOG_ERR("Advertising failed: %d", err);
        return;
    }

    LOG_INF("BreathAnchor firmware started. Waiting for BLE connection...");
}`;

const deviceTreeOverlay = `// 文件: boards/nrf52840dk_nrf52840.overlay
// 设备树配置：PWM 输出引脚映射

/ {
    aliases {
        motor0 = &motor_pwm0;
    };
};

&pwm0 {
    status = "okay";
    pinctrl-0 = <&pwm0_default>;
    pinctrl-names = "default";
    
    motor_pwm0: motor_pwm0 {
        // P0.13 → DRV2605L IN 引脚
        pwms = <&pwm0 0 PWM_USEC(100) PWM_POLARITY_NORMAL>;
    };
};

&pinctrl {
    pwm0_default: pwm0_default {
        group1 {
            psels = <NRF_PSEL(PWM_OUT0, 0, 13)>;
        };
    };
};`;

const buildInstructions = `# 构建和烧录步骤（需要 nRF Connect SDK 环境）

# 1. 安装 nRF Connect SDK (v2.6.0+)
#    参考: https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/installation.html

# 2. 创建项目
west init -m https://github.com/nrfconnect/sdk-nrf breath-anchor-fw
cd breath-anchor-fw && west update

# 3. 构建（目标板: nRF52840 DK）
west build -b nrf52840dk_nrf52840 app

# 4. 烧录
west flash

# 5. 测试：用 nRF Connect App 连接设备，写入呼吸方案
#    写入数据示例（4-7-8呼吸法）:
#    04 00 04 46 01 01 07 1E 03 02 08 3C 02 03 01 00 00
#    解析: 4个phase | inhale 4s 70% ease-in | hold 7s 30% pulse | exhale 8s 60% ease-out | rest 1s 0% linear`;

export default function FirmwareDemo() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg text-white/90 font-medium">固件 Demo（可烧录验证）</h3>
      </div>

      <p className="text-sm text-white/40">
        以下是可以直接烧录到 nRF52840 DK 开发板的最小可行固件。
        配合一个 LRA 马达 + DRV2605L 驱动板（总成本约 ¥230），即可验证"触觉引导呼吸"的核心体验。
      </p>

      {/* 硬件清单 */}
      <div className="glass-card p-4 space-y-2">
        <h4 className="text-sm text-white/60 font-medium">验证所需硬件（总计 ~¥230）</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>• nRF52840 DK 开发板 — ¥199（淘宝/贸泽）</p>
          <p>• LRA 马达 Φ8mm — ¥5（1688 金龙机电）</p>
          <p>• DRV2605L 驱动板 — ¥18（Adafruit 兼容版，淘宝）</p>
          <p>• 杜邦线若干 — ¥3</p>
          <p>• 面包板 — ¥5</p>
        </div>
      </div>

      {/* 主固件代码 */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-white/5">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white/50">src/main.c</span>
          <span className="text-[10px] text-white/20 ml-auto">nRF Connect SDK / Zephyr RTOS</span>
        </div>
        <pre className="p-4 text-[11px] text-white/50 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto">
          <code>{firmwareCode}</code>
        </pre>
      </div>

      {/* 设备树 */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-white/5">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-white/50">boards/nrf52840dk_nrf52840.overlay</span>
        </div>
        <pre className="p-4 text-[11px] text-white/50 overflow-x-auto leading-relaxed">
          <code>{deviceTreeOverlay}</code>
        </pre>
      </div>

      {/* 构建说明 */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-white/5">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-white/50">构建 & 烧录</span>
        </div>
        <pre className="p-4 text-[11px] text-white/50 overflow-x-auto leading-relaxed">
          <code>{buildInstructions}</code>
        </pre>
      </div>

      {/* 代码说明 */}
      <div className="glass-card p-4 space-y-3">
        <h4 className="text-sm text-white/60 font-medium">代码架构说明</h4>
        <div className="text-xs text-white/40 space-y-2">
          <p><span className="text-white/60">呼吸引擎线程：</span>独立线程以 50Hz（20ms）频率更新 PWM 输出。根据当前 phase 的 type 和 pattern 计算实时振动强度。这个 20ms 更新周期就是我们"端到端延迟"中固件处理部分的来源。</p>
          <p><span className="text-white/60">BLE 协议设计：</span>自定义 GATT Service，一个 Write Characteristic 接收完整呼吸方案。方案一次性下发到设备端本地执行，避免了逐 phase 实时下发的延迟问题（对应延迟链路分析中的"方案B"）。</p>
          <p><span className="text-white/60">PWM 驱动策略：</span>10kHz PWM 载波频率用于调制 LRA 马达的振动包络。LRA 的谐振频率约 170Hz，PWM 载波远高于谐振频率，马达只响应包络变化。</p>
        </div>
      </div>

      {/* 下一步 */}
      <div className="glass-card p-4 border-l-2 border-blue-500/50 space-y-2">
        <h4 className="text-sm text-blue-300/80">如果要做物理原型验证</h4>
        <div className="text-xs text-white/40 space-y-1">
          <p>1. 烧录上述代码到 nRF52840 DK</p>
          <p>2. 用 nRF Connect App 连接，发送 4-7-8 呼吸方案数据</p>
          <p>3. 握住连接了马达的开发板，闭眼体验 5 分钟</p>
          <p>4. 记录：振动强度是否舒适？节奏是否自然？有没有想跟着呼吸的冲动？</p>
          <p>5. 找 5 个朋友重复步骤 3-4，收集反馈</p>
          <p className="text-white/60 pt-1">→ 这一步完成后，你就能回答"触觉引导到底有没有用"的核心问题</p>
        </div>
      </div>
    </div>
  )
}
