#include "max30102.h"
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "config.h"

extern SemaphoreHandle_t i2cMutex;

MAX30105 particleSensor;

bool MAX30102Sensor::begin() {
    Serial.print("→ MAX30102 sensor: ");
    
    // Use standard I2C speed to match the bus (100kHz set in setup)
    if (particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
        Serial.println("OK");
        Serial.println("   Place finger on sensor with steady pressure");

        // SparkFun default config BUT with ledMode=2 (Red+IR) for MAX30102
        // MAX30102 only has 2 LEDs — default ledMode=3 is for MAX30105 (3 LEDs)
        // Red LED needs full power for SpO2 ratio (not dimmed)
        particleSensor.setup(0x1F, 4, 2, 400, 411, 4096);  // ledMode=2 for MAX30102
        particleSensor.setPulseAmplitudeGreen(0);     // No green LED on MAX30102
        
        delay(100);
        long testIR = particleSensor.getIR();
        if (testIR > 0) {
            maxSensorOK = true;
            Serial.print("   Initial IR: ");
            Serial.println(testIR);
        } else {
            maxSensorOK = false;
            Serial.println("   WARNING: No IR reading");
        }
    } else {
        maxSensorOK = false;
        Serial.println("FAILED - Not detected");
    }
    
    return maxSensorOK;
}

void MAX30102Sensor::update() {
    // ---- NON-BLOCKING FIFO READ ----
    // check() reads all available FIFO data via I2C (non-blocking)
    // Then we process EVERY buffered sample through checkForBeat()
    // This is critical: getIR() only returns 1 sample and blocks.
    // check()+available()+getFIFOIR() processes ALL samples without blocking.
    particleSensor.check();
    
    while (particleSensor.available()) {
        long irValue = particleSensor.getFIFOIR();
        long redValue = particleSensor.getFIFORed();
        lastIRValue = irValue;
        lastRedValue = redValue;
        
        particleSensor.nextSample();  // Advance to next sample in buffer
        
        // No finger = reset
        if (irValue < MIN_IR_VALUE) {
            heartRate = 0;
            beatsPerMinute = 0;
            beatAvg = 0;
            maxSensorOK = false;
            for (byte i = 0; i < RATE_SIZE; i++) rates[i] = 0;
            continue;  // Process remaining samples
        }
        
        maxSensorOK = true;
        
        // ---- BEAT DETECTION (SparkFun Example5 logic, verbatim) ----
        if (checkForBeat(irValue) == true) {
            long delta = millis() - lastBeat;
            lastBeat = millis();
            
            beatsPerMinute = 60 / (delta / 1000.0);
            
            Serial.printf("[MAX30102] BEAT! Delta=%ldms, BPM=%.1f\n", delta, beatsPerMinute);
            
            if (beatsPerMinute < 255 && beatsPerMinute > 20) {
                rates[rateSpot++] = (byte)beatsPerMinute;
                rateSpot %= RATE_SIZE;
                
                // Take average of readings
                beatAvg = 0;
                for (byte x = 0; x < RATE_SIZE; x++)
                    beatAvg += rates[x];
                beatAvg /= RATE_SIZE;
            }
        }
        
        // Show live BPM directly — no filtering, no warm-up
        heartRate = beatAvg;
    }
    
    // Debug output every 2 seconds
    static unsigned long lastDebugPrint = 0;
    if (millis() - lastDebugPrint > 2000) {
        Serial.printf("[MAX30102] IR=%ld, RED=%ld, BPM=%.1f, Avg=%d, OK=%d\n",
                      lastIRValue, lastRedValue, beatsPerMinute, beatAvg, maxSensorOK);
        lastDebugPrint = millis();
    }
}

float MAX30102Sensor::getHeartRate() {
    return heartRate;
}

bool MAX30102Sensor::sensorOK() {
    return maxSensorOK;
}

long MAX30102Sensor::getIR() {
    return lastIRValue;
}

long MAX30102Sensor::getRed() {
    return lastRedValue;
}
