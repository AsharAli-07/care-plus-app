# WatchFWC3

ESP32-C3 firmware variant for the wrist watch project with updated GPIO mapping and battery signal support pins.

## Pin Mapping (Current)

- I2C SDA: GPIO 8
- I2C SCL: GPIO 9
- LM35 analog: GPIO 0
- Buzzer: GPIO 4
- Panic button: GPIO 3 (active low with pull-up)
- VBAT ADC: GPIO 1
- CHRG status: GPIO 2

## Firmware Changes Applied

- Updated pin definitions in config.h for ESP32-C3 map.
- Added PANIC_BUTTON_PIN, VBAT_ADC_PIN, and CHRG_PIN constants.
- Updated main setup to initialize panic button from PANIC_BUTTON_PIN.
- Updated I2C clock setup to use I2C_FREQ constant.

## Wiring

See wiring details in wiring.txt.

## Arduino IDE Guide

For full setup and troubleshooting, see ARDUINO_IDE_GUIDE.md.

## Build / Upload

1. Open WatchFWC3.ino in Arduino IDE.
2. In Tools > Board, select ESP32C3 Dev Module (or your exact C3 board).
3. Confirm the correct COM port in Tools > Port.
4. Click Upload.
5. Open Serial Monitor at 115200 baud.

## Bring-up Checklist

1. Confirm I2C devices are detected at 0x3C, 0x57, and 0x68 during startup scan.
2. Verify buzzer response on power ON/OFF hold behavior.
3. Verify panic button short press triggers panic state.
4. Verify LM35 temperature value is non-zero and stable.
5. Add battery read logic later using VBAT_ADC_PIN and CHRG_PIN.

## Next Suggested Step

Implement battery telemetry by:
- reading VBAT_ADC_PIN,
- converting ADC to battery voltage via divider ratio,
- reading CHRG_PIN as charging status,
- sending both in BLE payload and showing on OLED.
