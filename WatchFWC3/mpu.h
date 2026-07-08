#ifndef MPU_H
#define MPU_H

#include <Arduino.h>

struct MPUData {
  int16_t ax, ay, az;
  int16_t gx, gy, gz;
};

class MPU {
public:
  bool begin();
  void update();
  MPUData get();

  bool isShaking();
  bool isFall();

private:
  MPUData data;
  MPUData last;
  bool fallArmed = false;
unsigned long fallTimer = 0;
  void writeReg(uint8_t reg, uint8_t val);
  uint8_t readReg(uint8_t reg);
  int16_t read16(uint8_t reg);
  float accelMagnitude();
};

#endif
