#include "buzzer.h"

void Buzzer::begin(uint8_t pin) {
  buzzerPin = pin;
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
  Serial.printf("Buzzer initialized on Pin %d\n", buzzerPin);
}

void Buzzer::beep(int duration) {
  digitalWrite(buzzerPin, HIGH);
  delay(duration);
  digitalWrite(buzzerPin, LOW);
}

void Buzzer::powerOnBeep() {
  Serial.println("[BUZZER] Power ON beep");
  beep(100);  // Single 100ms beep on power on
}

void Buzzer::powerOffBeep() {
  Serial.println("[BUZZER] Power OFF beep");
  beep(100);  // Single 100ms beep on power off
}
