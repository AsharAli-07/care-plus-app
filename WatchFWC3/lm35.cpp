#include "lm35.h"
#include "config.h"

bool LM35Sensor::begin(int pin) {
    adcPin = pin;
    
    Serial.print("→ LM35 Temperature Sensor: ");
    Serial.print("GPIO ");
    Serial.println(pin);
    
    // Configure ADC pin
    pinMode(adcPin, INPUT);
    analogSetAttenuation(ADC_11db);  // Full range on ESP32-C3
    
    // Test read to verify sensor is connected
    delay(100);
    
    // Use analogReadMilliVolts() for accurate calibrated reading
    // ESP32-C3 ADC with 11db attenuation has ~2.5V range, NOT 3.3V
    // analogReadMilliVolts() uses factory eFuse calibration — no manual Vref needed
    int testMilliVolts = analogReadMilliVolts(adcPin);
    int testRaw = analogRead(adcPin);
    
    // LM35: 10mV per °C — reasonable range is 100-500mV (10-50°C)
    if (testMilliVolts > 50 && testMilliVolts < 1000) {
        lm35SensorOK = true;
        
        // Initialize running average with first reading
        runningAvg = (float)testMilliVolts;
        runningAvgInitialized = true;
        
        float tempC = (testMilliVolts / 10.0) + LM35_TEMP_OFFSET_C;
        float tempF = (tempC * 9.0 / 5.0) + 32.0;
        
        Serial.print("   Initial: ");
        Serial.print(testMilliVolts);
        Serial.print("mV (ADC=");
        Serial.print(testRaw);
        Serial.print(") → ");
        Serial.print(tempC, 1);
        Serial.print("°C / ");
        Serial.print(tempF, 1);
        Serial.println("°F");
    } else {
        lm35SensorOK = false;
        Serial.print("   WARNING: Unusual reading: ");
        Serial.print(testMilliVolts);
        Serial.println("mV");
    }
    
    return lm35SensorOK;
}

void LM35Sensor::update() {
    unsigned long currentTime = millis();
    
    // Sample every 100ms (10 samples per second)
    if (currentTime - lastSampleTime < 100) return;
    lastSampleTime = currentTime;
    
    // Read calibrated millivolts directly (uses ESP32 eFuse calibration)
    // This is the KEY fix: analogRead() with manual 3.3V conversion was WRONG
    // because ESP32-C3 ADC_11db range is ~2.5V, not 3.3V
    int milliVolts = analogReadMilliVolts(adcPin);
    rawADC = analogRead(adcPin);  // Keep raw ADC for debug only
    
    // ---- OUTLIER REJECTION (based on millivolts now) ----
    if (runningAvgInitialized) {
        float diff = abs((float)milliVolts - runningAvg);
        if (diff > 20.0) {  // Reject if >20mV from average (was >15 ADC counts)
            runningAvg = runningAvg * 0.99 + milliVolts * 0.01;
            return;
        }
    }
    
    // Update running average
    if (!runningAvgInitialized) {
        runningAvg = (float)milliVolts;
        runningAvgInitialized = true;
    } else {
        runningAvg = runningAvg * 0.95 + milliVolts * 0.05;
    }
    
    // Store millivolts in circular buffer for averaging
    samples[sampleIndex] = milliVolts;
    sampleIndex++;
    
    if (sampleIndex >= SAMPLE_SIZE) {
        sampleIndex = 0;
        bufferFilled = true;
    }
    
    // Calculate average millivolts from buffer
    int sum = 0;
    int count = bufferFilled ? SAMPLE_SIZE : sampleIndex;
    
    if (count == 0) count = 1; // Prevent division by zero
    
    for (int i = 0; i < count; i++) {
        sum += samples[i];
    }
    
    float avgMilliVolts = (float)sum / count;
    
    // Convert millivolts to temperature
    // LM35: 10mV per °C — simply divide by 10
    float tempCelsius = avgMilliVolts / 10.0;
    
    // Apply calibration offset (for any residual PCB heat)
    tempCelsius += LM35_TEMP_OFFSET_C;
    
    // Clamp to sane minimum
    if (tempCelsius < 0.0f) tempCelsius = 0.0f;
    
    // Convert Celsius to Fahrenheit: (C × 9/5) + 32, and add +2 user offset
    temperature = (tempCelsius * 9.0 / 5.0) + 32.0;
    
    // Limit to human's highest possible temperature
    if (temperature > 109.4f) {
        temperature = 109.4f;
    }
    
    // Sanity check
    if (temperature >= 32 && temperature <= 302) {
        lm35SensorOK = true;
    } else {
        lm35SensorOK = false;
    }
    
    // Debug output every 2 seconds
    static unsigned long lastDebugPrint = 0;
    if (millis() - lastDebugPrint > 2000) {
        Serial.printf("[LM35] Raw=%dmV (ADC=%d), Avg=%.1fmV, Temp=%.1f°F (%.1f°C), OK=%d\n", 
                      milliVolts, rawADC, avgMilliVolts, temperature, tempCelsius, lm35SensorOK);
        lastDebugPrint = millis();
    }
}

float LM35Sensor::getTemperature() {
    return temperature;
}

bool LM35Sensor::sensorOK() {
    return lm35SensorOK;
}

int LM35Sensor::getRawADC() {
    return rawADC;
}
