#ifndef OLED_H
#define OLED_H

#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>

class OLEDDisplay {
public:
  void begin();
  void clear();
  void drawStartup(const char* message);
  void drawWatch(int year, int month, int day, int hours, int minutes, int seconds, float bpm, float temp, int spo2, const char* status, int batteryPercent, bool isCharging, bool bleConnected, bool panicActive, const char* ampm);

private:
  void drawBattery(int x, int y, int percent, bool isCharging);
  void drawHeartIcon(int x, int y);
  void drawTempIcon(int x, int y);
  void drawSpO2Icon(int x, int y);
  void drawBLEIcon(int x, int y);

  // Use HARDWARE I2C (shares bus with MAX30102 and MPU)
  // SH1106 or SSD1306 - try both if one doesn't work
  U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2 = 
    U8G2_SSD1306_128X64_NONAME_F_HW_I2C(U8G2_R0, U8X8_PIN_NONE);
};

#endif
