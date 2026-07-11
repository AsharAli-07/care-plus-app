#include "oled.h"
#include "config.h"

void OLEDDisplay::begin() {
  // Initialize with hardware I2C (uses Wire object initialized in main setup)
  u8g2.setBusClock(100000);  // Match I2C clock speed
  u8g2.begin();
  u8g2.setContrast(255);
  Serial.println("[OLED] ✓ Initialized with hardware I2C");
}

void OLEDDisplay::clear() {
  u8g2.clearBuffer();
}

void OLEDDisplay::drawStartup(const char* message) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB10_tr);
  u8g2.drawStr(10, 32, message);
  u8g2.sendBuffer();
}

void OLEDDisplay::drawBattery(int x, int y, int percent, bool isCharging) {
  // Draw outer shell (16x9 pixels)
  u8g2.drawFrame(x, y, 16, 9);
  u8g2.drawBox(x + 16, y + 2, 2, 5); // battery tip

  if (isCharging) {
    // Draw tiny lightning bolt inside battery
    u8g2.drawLine(x + 8, y + 1, x + 4, y + 4);
    u8g2.drawLine(x + 4, y + 4, x + 10, y + 4);
    u8g2.drawLine(x + 10, y + 4, x + 6, y + 7);
  } else {
    // Fill level inside
    int fillWidth = (12 * percent) / 100;
    if (fillWidth < 1 && percent > 0) fillWidth = 1;
    if (fillWidth > 12) fillWidth = 12;
    u8g2.drawBox(x + 2, y + 2, fillWidth, 5);
  }
}

void OLEDDisplay::drawHeartIcon(int x, int y) {
  // 5x5 pixel heart
  u8g2.drawPixel(x + 1, y);
  u8g2.drawPixel(x + 3, y);
  u8g2.drawBox(x, y + 1, 5, 2);
  u8g2.drawBox(x + 1, y + 3, 3, 1);
  u8g2.drawPixel(x + 2, y + 4);
}

void OLEDDisplay::drawTempIcon(int x, int y) {
  // Thermometer icon (height 9px, width 5px)
  u8g2.drawFrame(x + 1, y, 3, 6);
  u8g2.drawBox(x, y + 5, 5, 4);
  u8g2.drawPixel(x + 2, y + 2); // mercury line
}

void OLEDDisplay::drawSpO2Icon(int x, int y) {
  // Oxygen droplet shape (height 8px, width 5px)
  u8g2.drawPixel(x + 2, y);
  u8g2.drawLine(x + 1, y + 1, x + 3, y + 1);
  u8g2.drawBox(x, y + 2, 5, 4);
  u8g2.drawPixel(x + 1, y + 6);
  u8g2.drawPixel(x + 2, y + 6);
  u8g2.drawPixel(x + 3, y + 6);
}

void OLEDDisplay::drawBLEIcon(int x, int y) {
  // BLE connection icon
  u8g2.drawVLine(x + 2, y, 7);
  u8g2.drawLine(x + 2, y, x + 4, y + 2);
  u8g2.drawLine(x + 4, y + 2, x, y + 5);
  u8g2.drawLine(x + 2, y + 6, x + 4, y + 4);
  u8g2.drawLine(x + 4, y + 4, x, y + 1);
}

void OLEDDisplay::drawWatch(int year, int month, int day, int hours, int minutes, int seconds, float bpm, float temp, int spo2, const char* status, int batteryPercent, bool isCharging, bool bleConnected, bool panicActive, const char* ampm) {
  u8g2.clearBuffer();

  // ===== TOP BAR: DATE, BLE, BATTERY =====
  u8g2.setFont(u8g2_font_6x10_tr);
  char dateStr[12];
  snprintf(dateStr, sizeof(dateStr), "%04d-%02d-%02d", year, month, day);
  u8g2.drawStr(2, 9, dateStr);

  if (bleConnected) {
    drawBLEIcon(74, 2);
  }

  char batStr[8];
  snprintf(batStr, sizeof(batStr), "%d%%", batteryPercent);
  u8g2.setFont(u8g2_font_6x10_tr);
  int batStrWidth = u8g2.getStrWidth(batStr);
  u8g2.drawStr(108 - batStrWidth, 9, batStr);
  drawBattery(110, 1, batteryPercent, isCharging);

  // Horizontal divider
  u8g2.drawHLine(0, 12, 128);

  // ===== LEFT REGION: TIME & STATUS =====
  u8g2.setFont(u8g2_font_fub20_tn);
  char timeStr[6];
  snprintf(timeStr, sizeof(timeStr), "%02d:%02d", hours, minutes);
  u8g2.drawStr(2, 38, timeStr);

  u8g2.setFont(u8g2_font_6x10_tr);
  int secX = 76;   // Fixed X position for seconds
  int ampmX = 80;  // Shifted slightly more to the right than seconds
  
  char secStr[4];
  snprintf(secStr, sizeof(secStr), ":%02d", seconds);
  u8g2.drawStr(secX, 26, secStr);
  u8g2.drawStr(ampmX, 38, ampm);

  // Status / Alert panel at the bottom-left
  if (panicActive) {
    bool blinkState = (millis() / 300) % 2 == 0;
    if (blinkState) {
      u8g2.drawBox(2, 45, 92, 17);
      u8g2.setDrawColor(0);
      u8g2.setFont(u8g2_font_ncenB10_tr);
      u8g2.drawStr(24, 58, "PANIC!");
      u8g2.setDrawColor(1);
    } else {
      u8g2.drawFrame(2, 45, 92, 17);
      u8g2.setFont(u8g2_font_ncenB10_tr);
      u8g2.drawStr(24, 58, "PANIC!");
    }
  } else {
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawFrame(2, 45, 92, 17);
    int statusWidth = u8g2.getStrWidth(status);
    u8g2.drawStr(2 + (92 - statusWidth) / 2, 57, status);
  }

  // ===== VERTICAL DIVIDER =====
  u8g2.drawVLine(96, 13, 51);

  // ===== RIGHT REGION: HEALTH VITALS =====
  u8g2.setFont(u8g2_font_ncenB10_tr);
  char valStr[8];
  int w;

  // Row 1: BPM
  drawHeartIcon(99, 18);
  if (bpm > 0) {
    snprintf(valStr, sizeof(valStr), "%d", (int)bpm);
  } else {
    strcpy(valStr, "--");
  }
  w = u8g2.getStrWidth(valStr);
  u8g2.drawStr(127 - w, 26, valStr);

  // Row 2: Temperature
  drawTempIcon(99, 33);
  if (temp > 0) {
    snprintf(valStr, sizeof(valStr), "%d", (int)temp);
  } else {
    strcpy(valStr, "--");
  }
  w = u8g2.getStrWidth(valStr);
  u8g2.drawStr(127 - w, 42, valStr);

  // Row 3: SpO2
  drawSpO2Icon(99, 49);
  if (spo2 > 0) {
    snprintf(valStr, sizeof(valStr), "%d", spo2);
  } else {
    strcpy(valStr, "--");
  }
  w = u8g2.getStrWidth(valStr);
  u8g2.drawStr(127 - w, 57, valStr);

  u8g2.sendBuffer();
}