#ifndef CONFIG_H
#define CONFIG_H

#include <Wire.h>

// ==================== I2C CONFIGURATION ====================
// Use 100kHz for stable multi-device communication
// (MPU + MAX30102 + OLED on same bus)
#define I2C_SDA 8
#define I2C_SCL 9
#define I2C_FREQ 100000

// ==================== MPU6050 CONFIGURATION ====================
#define MPU_ADDR 0x68

// ==================== MAX30102 CONFIGURATION ====================
#define MAX_INT_PIN -1          // Not used in current firmware
#define MAX_I2C_ADDR 0x57
#define MIN_IR_VALUE 50000      // Minimum IR value for reliable finger detection
#define SAMPLE_INTERVAL 10      // 100Hz sampling (10ms)
#define MAX_LED_BRIGHTNESS 0x40 // LED current ~12.8mA for stronger pulsatile signal
#define MIN_VALID_BEATS 4       // Require 4 valid beats before displaying HR

// ==================== LM35 CONFIGURATION ====================
#define LM35_PIN 0              // GPIO 0 for analog temperature reading
#define LM35_TEMP_OFFSET_C -2.0f  // Calibration offset in °C (adjust if needed for PCB heat)

// ==================== BUZZER CONFIGURATION ====================
#define BUZZER_PIN 4            // GPIO 4 for buzzer

// ==================== BUTTON / BATTERY CONFIGURATION ====================
#define PANIC_BUTTON_PIN 3      // GPIO 3 for panic button (active low, pull-up)
#define VBAT_ADC_PIN 1          // GPIO 1 for battery voltage ADC
#define CHRG_PIN 2              // GPIO 2 for TP charge status pin
#define BATTERY_ADC_REF_V 3.3f  // ESP32-C3 ADC reference voltage
#define VBAT_DIVIDER_RATIO 2.0f // VBAT sensing divider ratio (Vbat = Vadc * ratio)
#define BATTERY_MIN_V 3.20f     // 0% battery voltage
#define BATTERY_MAX_V 4.20f     // 100% battery voltage

// ==================== OLED CONFIGURATION ====================
#define OLED_WIDTH 130
#define OLED_HEIGHT 64
#define OLED_ADDR 0x3C          // Typical SSD1306 address

#endif
