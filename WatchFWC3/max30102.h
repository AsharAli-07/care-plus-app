#ifndef MAX30102_H
#define MAX30102_H

#include <Arduino.h>
#include "config.h"

class MAX30102Sensor {
public:
    bool begin();             // Initialize sensor
    void update();            // Call in loop to update readings
    float getHeartRate();     // Returns BPM
    bool sensorOK();          // Returns true if IR signal valid
    long getIR();             // Returns current IR value
    long getRed();            // Returns current RED value

private:
    float heartRate = 0.0;
    bool maxSensorOK = false;

    // Heartbeat averaging (matches SparkFun Example5 exactly)
    static const byte RATE_SIZE = 4;
    byte rates[RATE_SIZE] = {0};
    byte rateSpot = 0;
    long lastBeat = 0;
    float beatsPerMinute = 0;
    int beatAvg = 0;

    long lastIRValue = 0;
    long lastRedValue = 0;
};

#endif
