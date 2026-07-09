// Minimal sensor test - tests MAX30102 and MPU without OLED
#include <Wire.h>
#include "MAX30105.h"

#define MPU_ADDR 0x68

MAX30105 particleSensor;

// MPU functions
void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t mpuRead(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)1);
  return Wire.read();
}

int16_t mpuRead16(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)2);
  return Wire.read() << 8 | Wire.read();
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n=== MINIMAL SENSOR TEST ===");
  Serial.println("Testing MAX30102 and MPU without OLED\n");
  
  // Initialize I2C ONCE
  Wire.begin(8, 9);
  Wire.setClock(100000);
  delay(500);
  
  // Test MPU
  Serial.println("→ Testing MPU...");
  uint8_t whoami = mpuRead(0x75);
  Serial.printf("  WHO_AM_I: 0x%02X\n", whoami);
  
  if (whoami == 0x68 || whoami == 0x70 || whoami == 0x71) {
    Serial.println("  ✓ MPU detected");
    
    // Wake and configure
    mpuWrite(0x6B, 0x00);  // Wake
    delay(100);
    mpuWrite(0x1C, 0x00);  // ±2g
    mpuWrite(0x1B, 0x00);  // ±250°/s
    
    // Read test values
    int16_t ax = mpuRead16(0x3B);
    int16_t ay = mpuRead16(0x3D);
    int16_t az = mpuRead16(0x3F);
    
    Serial.printf("  Accel: %d, %d, %d\n", ax, ay, az);
    
    if (ax == -1 && ay == -1 && az == -1) {
      Serial.println("  ✗ Getting -1 values (I2C error)");
    } else {
      Serial.println("  ✓ MPU reading successfully!");
    }
  } else {
    Serial.println("  ✗ MPU not responding");
  }
  
  Serial.println();
  
  // Test MAX30102
  Serial.println("→ Testing MAX30102...");
  
  if (particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("  ✓ MAX30102 detected");
    
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    
    delay(100);
    long ir = particleSensor.getIR();
    Serial.printf("  IR reading: %ld\n", ir);
    
    if (ir > 0) {
      Serial.println("  ✓ MAX30102 working!");
    } else {
      Serial.println("  ⚠ IR=0 (place finger on sensor)");
    }
  } else {
    Serial.println("  ✗ MAX30102 not responding");
  }
  
  Serial.println("\n=== Test complete ===");
}

void loop() {
  delay(500);
  
  // Continuous readings
  int16_t ax = mpuRead16(0x3B);
  int16_t ay = mpuRead16(0x3D);
  int16_t az = mpuRead16(0x3F);
  
  long ir = particleSensor.getIR();
  
  Serial.printf("MPU: %6d %6d %6d | MAX IR: %ld\n", ax, ay, az, ir);
}
