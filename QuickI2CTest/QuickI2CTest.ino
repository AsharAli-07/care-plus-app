// Quick I2C Test - Upload this to verify sensors are detected
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("\n=== I2C QUICK TEST ===\n");
  
  Wire.begin(8, 9);  // SDA=8, SCL=9
  Wire.setClock(100000);
  delay(500);
  
  Serial.println("Scanning I2C bus...");
  byte found = 0;
  
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  FOUND: 0x%02X", addr);
      
      if (addr == 0x3C) Serial.print(" (OLED)");
      if (addr == 0x57) Serial.print(" (MAX30102)");
      if (addr == 0x68) Serial.print(" (MPU6050)");
      if (addr == 0x70) Serial.print(" (MPU6500)");
      if (addr == 0x71) Serial.print(" (MPU9250)");
      
      Serial.println();
      found++;
    }
  }
  
  Serial.printf("\nTotal: %d devices\n", found);
  
  if (found == 0) {
    Serial.println("\n!! NO DEVICES FOUND !!");
    Serial.println("Check:");
    Serial.println("  - 3.3V power");
    Serial.println("  - GND connections");
    Serial.println("  - SDA/SCL wiring");
  }
}

void loop() {
  delay(5000);
  Serial.println("\nPress reset to scan again...");
}
