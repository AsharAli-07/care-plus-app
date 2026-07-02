#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class Buzzer {
public:
  void begin(uint8_t pin);
  void beep(int duration = 100);  // Single beep with duration in ms
  void powerOnBeep();   // Beep for power on
  void powerOffBeep();  // Beep for power off

private:
  uint8_t buzzerPin = 12;
};

#endif
