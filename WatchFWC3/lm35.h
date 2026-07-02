#ifndef LM35_H
#define LM35_H

#include <Arduino.h>

class LM35Sensor {
public:
    bool begin(int pin);           // Initialize sensor with GPIO pin
    void update();                 // Call in loop to update readings
    float getTemperature();        // Returns temperature in Fahrenheit
    bool sensorOK();               // Returns true if sensor is working
    int getRawADC();               // Returns raw ADC value for debugging

private:
    int adcPin = -1;
    float temperature = 0.0;
    bool lm35SensorOK = false;
    
    // Averaging for stable readings (3 seconds at 10Hz)
    static const int SAMPLE_SIZE = 30;
    int samples[SAMPLE_SIZE] = {0};
    int sampleIndex = 0;
    bool bufferFilled = false;
    
    // Running average for outlier rejection
    float runningAvg = 0.0;
    bool runningAvgInitialized = false;
    
    unsigned long lastSampleTime = 0;
    int rawADC = 0;
};

#endif
