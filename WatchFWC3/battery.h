#ifndef BATTERY_H
#define BATTERY_H

#include <Arduino.h>

class BatteryMonitor {
public:
    bool begin(int vbatPin, int chrgPin);
    void update();

    int getPercentage() const;
    float getVoltage() const;
    bool isCharging() const;
    bool sensorOK() const;
    int getRawADC() const;

private:
    int adcPin = -1;
    int chargePin = -1;
    int rawADC = 0;
    float voltage = 0.0f;
    int percentage = 0;
    bool charging = false;
    bool batteryOK = false;
    unsigned long lastSampleTime = 0;

    static int clampPercent(int value);
};

#endif
