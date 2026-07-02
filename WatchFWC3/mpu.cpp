#include "mpu.h"
#include "config.h"
#include <Wire.h>

void MPU::writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t MPU::readReg(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)1);
  return Wire.read();
}

int16_t MPU::read16(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)2);
  int16_t v = Wire.read() << 8 | Wire.read();
  return v;
}

bool MPU::begin() {
  // Check WHO_AM_I register
  // MPU6050: 0x68
  // MPU6500: 0x70
  // MPU9250: 0x71
  uint8_t whoami = readReg(0x75);
  Serial.print("[MPU] WHO_AM_I: 0x");
  Serial.println(whoami, HEX);
  
  if (whoami != 0x68 && whoami != 0x70 && whoami != 0x71) {
    Serial.print("[MPU] ✗ Unrecognized chip! Expected 0x68/0x70/0x71, got 0x");
    Serial.println(whoami, HEX);
    return false;
  }

  // Identify chip type
  if (whoami == 0x68) {
    Serial.println("[MPU] ✓ MPU6050 detected");
  } else if (whoami == 0x70) {
    Serial.println("[MPU] ✓ MPU6500 detected");
  } else if (whoami == 0x71) {
    Serial.println("[MPU] ✓ MPU9250 detected");
  }

  // Wake up MPU (clear sleep bit)
  Serial.println("[MPU] Waking up sensor...");
  writeReg(0x6B, 0x00);
  delay(100);

  // Configure accelerometer: ±2g
  Serial.println("[MPU] Configuring accelerometer (±2g)...");
  writeReg(0x1C, 0x00);

  // Configure gyroscope: ±250 dps
  Serial.println("[MPU] Configuring gyroscope (±250°/s)...");
  writeReg(0x1B, 0x00);
  
  Serial.println("[MPU] ✓ Initialization complete");
  return true;
}

void MPU::update() {
  // Read directly (no mutex needed on single-core ESP32-C3)
  last = data;

  data.ax = read16(0x3B);
  data.ay = read16(0x3D);
  data.az = read16(0x3F);
  data.gx = read16(0x43);
  data.gy = read16(0x45);
  data.gz = read16(0x47);
  
  // Debug output every 2 seconds
  static unsigned long lastDebugPrint = 0;
  if (millis() - lastDebugPrint > 2000) {
    Serial.print("[MPU] A: ");
    Serial.print(data.ax); Serial.print(" ");
    Serial.print(data.ay); Serial.print(" ");
    Serial.print(data.az);
    Serial.print(" | G: ");
    Serial.print(data.gx); Serial.print(" ");
    Serial.print(data.gy); Serial.print(" ");
    Serial.println(data.gz);
    lastDebugPrint = millis();
  }
}

MPUData MPU::get() {
  return data;
}

float MPU::accelMagnitude() {
  float ax = data.ax / 16384.0;
  float ay = data.ay / 16384.0;
  float az = data.az / 16384.0;
  return sqrt(ax*ax + ay*ay + az*az);
}

bool MPU::isShaking() {
  int delta =
    abs(data.ax - last.ax) +
    abs(data.ay - last.ay) +
    abs(data.az - last.az);

  return delta > 25000;
}

bool MPU::isFall() {
  float mag = accelMagnitude();

  if (mag < 0.5) fallArmed = true;
  if (fallArmed && mag > 2.7) {
    fallArmed = false;
    return true;
  }
  return false;
}
