#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Device name for BLE advertising
#define BLE_DEVICE_NAME "HEALTH_WATCH"

// BLE UUIDs
#define SERVICE_UUID        "0000180d-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID "00002a37-0000-1000-8000-00805f9b34fb"
#define TIME_SYNC_UUID      "00002a2b-0000-1000-8000-00805f9b34fb"  // Current Time Characteristic

// Time sync callback function (implemented in main sketch)
extern void onTimeReceived(int year, int month, int day, int hour, int minute, int second);

// Status codes
enum WatchStatus {
    STATUS_OK = 1,
    STATUS_SHAKING = 2,
    STATUS_FALL = 3
};

// Sensor data structure
struct SensorData {
    bool sensor1OK;      // MAX30102 status (s1)
    bool sensor2OK;      // MPU status (s2)
    bool sensor3OK;      // Temperature sensor status (s3)
    int heartRate;       // Heart rate BPM (h)
    float temperature;   // Temperature in °C (t)
    int spo2;            // SpO2 percentage (o)
    long irValue;        // IR value from MAX30102 (ir)
    long redValue;       // Red value from MAX30102 (red)
    WatchStatus status;  // Watch status (st)
    bool panic;          // Panic button status (p)
};

class BLECommunication {
public:
    void begin();                           // Initialize BLE
    void update();                          // Call in loop to handle BLE state
    void sendData(const SensorData& data);  // Send sensor data via BLE
    bool isConnected();                     // Check if client is connected
    
private:
    BLEServer* pServer;
    BLECharacteristic* dataCharacteristic;
    bool deviceConnected;
    
    unsigned long lastDataSend;
    const unsigned long DATA_SEND_INTERVAL = 1000;  // Send data every 1 second
    
    void startAdvertising();
    void stopAdvertising();
    
    friend class ServerCallbacks;  // Allow callbacks to access private members
};

// External instance (defined in communication.cpp)
extern BLECommunication bleComm;

#endif
