#include "communication.h"

// Global instance
BLECommunication bleComm;

// Time Sync Characteristic Callbacks
class TimeSyncCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        uint8_t* data = pCharacteristic->getData();
        size_t len = pCharacteristic->getLength();
        
        if (len >= 6) {
            // Format: 6 bytes [year offset from 2000, month, day, hour, minute, second]
            int year = (int)data[0] + 2000;
            int month = (int)data[1];
            int day = (int)data[2];
            int hour = (int)data[3];
            int minute = (int)data[4];
            int second = (int)data[5];
            
            Serial.printf("[BLE] Time sync received: %04d-%02d-%02d %02d:%02d:%02d\n", year, month, day, hour, minute, second);
            onTimeReceived(year, month, day, hour, minute, second);
        } else if (len >= 3) {
            // Legacy Format: 3 bytes [hour, minute, second]
            int hour = (int)data[0];
            int minute = (int)data[1];
            int second = (int)data[2];
            
            Serial.printf("[BLE] Time sync received: %02d:%02d:%02d\n", hour, minute, second);
            onTimeReceived(2024, 1, 1, hour, minute, second); // default date
        }
    }
};

// BLE Server Callbacks
class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        bleComm.deviceConnected = true;
        Serial.println("[BLE] ✓ Client connected");
    }

    void onDisconnect(BLEServer* pServer) {
        bleComm.deviceConnected = false;
        Serial.println("[BLE] ✗ Client disconnected");
        
        // Automatically restart advertising for next connection
        delay(500);
        bleComm.startAdvertising();
        Serial.println("[BLE] → Advertising restarted (waiting for next connection)");
    }
};

void BLECommunication::begin() {
    Serial.print("[BLE] Initializing ");
    Serial.print(BLE_DEVICE_NAME);
    Serial.println("...");
    
    // Initialize BLE
    BLEDevice::init(BLE_DEVICE_NAME);
    
    // Create BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());
    
    // Create Health Service (Heart Rate Service UUID)
    BLEService* healthService = pServer->createService(SERVICE_UUID);
    
    // Create Data Characteristic
    dataCharacteristic = healthService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
    );
    dataCharacteristic->addDescriptor(new BLE2902());
    
    // Create Time Sync Characteristic (for receiving time from mobile app)
    BLECharacteristic* timeSyncCharacteristic = healthService->createCharacteristic(
        TIME_SYNC_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    timeSyncCharacteristic->setCallbacks(new TimeSyncCallbacks());
    
    // Start the service
    healthService->start();
    
    // Initialize state
    deviceConnected = false;
    lastDataSend = 0;
    
    // Start advertising immediately
    startAdvertising();
    
    Serial.println("[BLE] ✓ Initialization complete");
    Serial.println("[BLE] → Device is now discoverable");
}

void BLECommunication::startAdvertising() {
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);  // 7.5ms
    pAdvertising->setMaxPreferred(0x12);  // 22.5ms
    BLEDevice::startAdvertising();
}

void BLECommunication::stopAdvertising() {
    BLEDevice::stopAdvertising();
}

void BLECommunication::update() {
    // Nothing to do here - callbacks handle everything
    // Could add connection timeout logic here if needed
}

bool BLECommunication::isConnected() {
    return deviceConnected;
}

void BLECommunication::sendData(const SensorData& data) {
    // Only send if connected and enough time has passed
    if (!deviceConnected) {
        return;
    }
    
    unsigned long currentTime = millis();
    if (currentTime - lastDataSend < DATA_SEND_INTERVAL) {
        return;
    }
    lastDataSend = currentTime;
    
    // Build compact JSON string
    // Format: {s1:"t",s2:"f",s3:"f",h:72,t:0,o:98,st:1,p:f}
    char payload[128];
    snprintf(payload, sizeof(payload),
             "{s1:\"%c\",s2:\"%c\",s3:\"%c\",h:%d,t:%.1f,o:%d,st:%d,p:%c}",
             data.sensor1OK ? 't' : 'f',
             data.sensor2OK ? 't' : 'f',
             data.sensor3OK ? 't' : 'f',
             data.heartRate,
             data.temperature,
             data.spo2,
             (int)data.status,
             data.panic ? 't' : 'f'
    );
    
    // Send via BLE
    dataCharacteristic->setValue(payload);
    dataCharacteristic->notify();
    
    // Debug output
    Serial.print("[BLE] Sent: ");
    Serial.println(payload);
}
