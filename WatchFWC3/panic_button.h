#ifndef PANIC_BUTTON_H
#define PANIC_BUTTON_H

#include <Arduino.h>

class PanicButton {
public:
  void begin(uint8_t pin);
  void update();
  bool isPanic();
  void clearPanic();

private:
  uint8_t buttonPin = 10;
  bool panicPressed = false;
  bool lastState = HIGH;
  unsigned long lastDebounceTime = 0;
  unsigned long panicStartTime = 0;
  static const unsigned long DEBOUNCE_DELAY = 50;
  static const unsigned long PANIC_DISPLAY_TIME = 2000; // 2 seconds
};

#endif
