#include "battery.h"
#include "config.h"

bool BatteryMonitor::begin(int vbatPin, int chrgPin) {
    adcPin = vbatPin;
    chargePin = chrgPin;

    pinMode(adcPin, INPUT);
    pinMode(chargePin, INPUT_PULLUP); // TP4056 CHRG is typically active LOW (open-drain)

    delay(20);
    rawADC = analogRead(adcPin);
    batteryOK = (rawADC >= 0 && rawADC <= 4095);
    update();

    Serial.printf("[BATTERY] VBAT pin GPIO%d, CHRG pin GPIO%d\n", adcPin, chargePin);
    return batteryOK;
}

void BatteryMonitor::update() {
    unsigned long now = millis();
    if (now - lastSampleTime < 1000) return; // 1Hz battery update is enough
    lastSampleTime = now;

    long sum = 0;
    static const int sampleCount = 8;
    for (int i = 0; i < sampleCount; i++) {
        sum += analogRead(adcPin);
        delayMicroseconds(300);
    }
    rawADC = (int)(sum / sampleCount);

    const float adcVoltage = (rawADC / 4095.0f) * BATTERY_ADC_REF_V;
    voltage = adcVoltage * VBAT_DIVIDER_RATIO;

    // int mapped = (int)(((voltage - BATTERY_MIN_V) * 100.0f) / (BATTERY_MAX_V - BATTERY_MIN_V));
    // percentage = clampPercent(mapped);
    static int fakeBattery = -1;
    if (fakeBattery == -1) fakeBattery = random(5, 101);
    percentage = fakeBattery;

    charging = (digitalRead(chargePin) == LOW);
    batteryOK = (rawADC >= 0 && rawADC <= 4095);
}

int BatteryMonitor::getPercentage() const {
    return percentage;
}

float BatteryMonitor::getVoltage() const {
    return voltage;
}

bool BatteryMonitor::isCharging() const {
    return charging;
}

bool BatteryMonitor::sensorOK() const {
    return batteryOK;
}

int BatteryMonitor::getRawADC() const {
    return rawADC;
}

int BatteryMonitor::clampPercent(int value) {
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
}
