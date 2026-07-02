#ifndef SPO2_H
#define SPO2_H

#include <Arduino.h>

class SPO2Calculator {
public:
    SPO2Calculator();
    void update(long irValue, long redValue);
    int getSpO2();
private:
    int spo2;
};

#endif
