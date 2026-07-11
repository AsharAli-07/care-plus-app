#include "panic_button.h"

void PanicButton::begin(uint8_t pin) {
  buttonPin = pin;
  pinMode(buttonPin, INPUT_PULLUP);
}

void PanicButton::update() {
  bool currentState = digitalRead(buttonPin);
  
  // Auto-clear panic after display time
  if (panicPressed && (millis() - panicStartTime > PANIC_DISPLAY_TIME)) {
    panicPressed = false;
    Serial.println("[PANIC] Alert cleared, returning to normal display");
  }
  
  // Debounce logic
  if (currentState != lastState) {
    lastDebounceTime = millis();
    
    // Button just pressed (HIGH to LOW transition)
    if (currentState == LOW) {
      if (!panicPressed) {
        panicPressed = true;
        panicStartTime = millis();
        Serial.println("!!! PANIC BUTTON PRESSED !!!");
        Serial.println("!!! PANIC SIGNAL SENT !!!");
      }
    }
  }
  
  lastState = currentState;
}

bool PanicButton::isPanic() {
  return panicPressed;
}

void PanicButton::clearPanic() {
  panicPressed = false;
}
