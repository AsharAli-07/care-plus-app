#include "spo2.h"

SPO2Calculator::SPO2Calculator() {
    spo2 = 0;
}

void SPO2Calculator::update(long irValue, long redValue) {
    // Skin/flesh absorbs red light heavily compared to IR.
    // Lower thresholds (IR > 30000, RED > 15000) allow SpO2 to be calculated on the wrist,
    // while still correctly detecting when the watch is off-hand (IR/RED < 1000).
    if (irValue < 30000 || redValue < 15000) {
        spo2 = 0; // Finger not present
        return;
    }
    
    // Simple SpO2 approximation for the watch
    float ratio = (float)redValue / (float)irValue;
    int calculatedSpO2 = 110 - (25 * ratio);
    
    // Clamp to realistic bounds
    if (calculatedSpO2 > 100) calculatedSpO2 = 100;
    if (calculatedSpO2 < 50) calculatedSpO2 = 50;
    
    // Smooth the value
    if (spo2 == 0) {
        spo2 = calculatedSpO2;
    } else {
        spo2 = (spo2 * 3 + calculatedSpO2) / 4;
    }
}

int SPO2Calculator::getSpO2() {
    return spo2;
}
