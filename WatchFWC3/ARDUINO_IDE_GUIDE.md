# Arduino IDE Guide for WatchFWC3

This guide explains how to set up Arduino IDE and upload WatchFWC3 firmware to ESP32-C3.

## 1) Install Arduino IDE

- Install Arduino IDE 2.x from the official Arduino website.

## 2) Add ESP32 Board Package URL

In Arduino IDE:

1. Open File > Preferences.
2. Find Additional Boards Manager URLs.
3. Add this URL:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
4. Click OK.

## 3) Install ESP32 Core

1. Open Tools > Board > Boards Manager.
2. Search for esp32.
3. Install ESP32 by Espressif Systems.

## 4) Install Required Libraries

Open Tools > Manage Libraries and install:

- U8g2 by olikraus
- SparkFun MAX3010x Pulse and Proximity Sensor Library

Notes:

- Wire, Preferences, BLEDevice, BLEServer, BLEUtils, and BLE2902 are provided by the ESP32 core.
- heartRate.h and MAX30105.h are provided by the SparkFun MAX3010x library.

## 5) Open the Firmware

1. Open WatchFWC3.ino from the WatchFWC3 folder.
2. Confirm all files in the folder are visible as tabs in Arduino IDE.

## 6) Select Board and Port

In Tools:

- Board: ESP32C3 Dev Module (or your specific ESP32-C3 board)
- Port: Select your board COM port

Recommended board settings (safe defaults):

- USB CDC On Boot: Enabled
- Upload Speed: 921600 (or 460800 if upload is unstable)
- CPU Frequency: 160MHz
- Flash Mode: QIO (board dependent)
- Partition Scheme: Default

## 7) Verify Pin Map Before Upload

Current WatchFWC3 pin map:

- SDA: GPIO 8
- SCL: GPIO 9
- LM35: GPIO 0
- Buzzer: GPIO 4
- Panic button: GPIO 3
- VBAT ADC: GPIO 1
- CHRG: GPIO 2

Check wiring details in wiring.txt.

## 8) Upload Firmware

1. Click Verify first.
2. Click Upload.
3. If asked, press BOOT while upload starts, then release.
4. Wait for Done uploading.

## 9) Open Serial Monitor

1. Open Serial Monitor.
2. Set baud to 115200.
3. On startup, verify:
   - I2C scan finds 0x3C, 0x57, and 0x68
   - Panic button initializes on GPIO 3
   - LM35 initializes on GPIO 0

## 10) Quick Troubleshooting

No COM port shown:

- Install USB-UART driver (if your board needs CP210x or CH340).
- Use a known data USB cable (not charge-only).
- Reconnect board and restart Arduino IDE.

Upload fails:

- Hold BOOT while upload begins.
- Lower upload speed to 460800.
- Confirm correct board and COM port.

I2C devices not found:

- Recheck SDA and SCL wiring on GPIO 8 and GPIO 9.
- Ensure all sensor grounds are common.
- Ensure all sensors are powered from 3.3V.

Build error for missing headers:

- Reinstall U8g2 and SparkFun MAX3010x libraries from Library Manager.
- Confirm ESP32 core is installed and selected.

## 11) Next Step

After first successful upload, battery telemetry can be added using:

- VBAT_ADC_PIN (GPIO 1) for voltage read
- CHRG_PIN (GPIO 2) for charging state
