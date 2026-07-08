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
Serial.println("[MPU] Configuring accelerometer (±8g)...");
  writeReg(0x1C, 0x10);

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
  // Use 4096.0 for ±8g scale
  float ax = data.ax / 4096.0;
  float ay = data.ay / 4096.0;
  float az = data.az / 4096.0;
  return sqrt(ax*ax + ay*ay + az*az);
}

bool MPU::isShaking() {
  float mag = accelMagnitude();
  
  // At rest, mag is ~1.0. 
  // A moderate shake will easily push it above 1.5 or below 0.5.
  // Adjust these thresholds (e.g., 1.3 to 1.8) to tune sensitivity.
  if (mag > 1.6 || mag < 0.4) {
    return true;
  }
  
  return false;
}

bool MPU::isFall() {
  float mag = accelMagnitude();

  // 1. Detect Freefall (weightlessness)
  // When falling, magnitude drops close to 0
  if (mag < 0.4) {
    fallArmed = true;
    fallTimer = millis(); // Continuously update timer while falling
  }

  // 2. Detect Impact IF armed
  if (fallArmed) {
    // If more than 1 second (1000ms) has passed since freefall ended, 
    // it was probably just a fast hand movement. Reset it.
    if (millis() - fallTimer > 1000) {
      fallArmed = false;
    } 
    // If we detect a hard impact immediately after falling
    else if (mag > 2.5) {
      fallArmed = false;
      return true;
    }
  }

  return false;
}