#include <Wire.h>
#include <Preferences.h>
#include "config.h"
#include "max30102.h"
#include "mpu.h"
#include "oled.h"
#include "panic_button.h"
#include "communication.h"
#include "lm35.h"
#include "buzzer.h"
#include "battery.h"
#include "spo2.h"

MAX30102Sensor hrSensor;
MPU mpu;
OLEDDisplay oled;
PanicButton panicBtn;
LM35Sensor tempSensor;
Buzzer buzzer;
BatteryMonitor battery;
SPO2Calculator spo2Calc;
Preferences preferences;  // NVS for persistent time storage

// Time tracking (24-hour format internally)
int currentYear = 2026;
int currentMonth = 1;
int currentDay = 1;
int currentHour = 11;
int currentMinute = 23;
int currentSecond = 0;
unsigned long lastSecondTime = 0;

// Save current time to NVS (Non-Volatile Storage)
void saveTimeToNVS() {
    preferences.begin("watch", false);  // Open NVS namespace "watch" in read-write mode
    preferences.putInt("year", currentYear);
    preferences.putInt("month", currentMonth);
    preferences.putInt("day", currentDay);
    preferences.putInt("hour", currentHour);
    preferences.putInt("minute", currentMinute);
    preferences.putInt("second", currentSecond);
    preferences.putBool("timeSaved", true);  // Flag that we have valid time
    preferences.end();
    Serial.println("[NVS] Time saved to flash memory");
}

// Load saved time from NVS
bool loadTimeFromNVS() {
    preferences.begin("watch", true);  // Open NVS namespace "watch" in read-only mode
    bool timeSaved = preferences.getBool("timeSaved", false);
    
    if (timeSaved) {
        currentYear = preferences.getInt("year", 2026);
        currentMonth = preferences.getInt("month", 1);
        currentDay = preferences.getInt("day", 1);
        currentHour = preferences.getInt("hour", 11);
        currentMinute = preferences.getInt("minute", 23);
        currentSecond = preferences.getInt("second", 0);
        preferences.end();
        Serial.printf("[NVS] Loaded saved time: %04d-%02d-%02d %02d:%02d:%02d\n", currentYear, currentMonth, currentDay, currentHour, currentMinute, currentSecond);
        return true;
    } else {
        preferences.end();
        Serial.println("[NVS] No saved time found, using default");
        return false;
    }
}

// BLE Time Sync Callback (called when mobile app sends time)
void onTimeReceived(int year, int month, int day, int hour, int minute, int second) {
    currentYear = year;
    currentMonth = month;
    currentDay = day;
    currentHour = hour;
    currentMinute = minute;
    currentSecond = second;
    lastSecondTime = millis();
    Serial.printf("[TIME] Synced to: %04d-%02d-%02d %02d:%02d:%02d\n", year, month, day, hour, minute, second);
    
    // Save the synced time to NVS so it persists across restarts
    saveTimeToNVS();
}

void setup() {
    Serial.begin(115200);
    delay(2000);
    
    Serial.println("\n╔═══════════════════════════════════════╗");
    Serial.println("║   ESP32-C3 Health Watch v2.1         ║");
    Serial.println("║   Premium UI & Safety Firmware       ║");
    Serial.println("╚═══════════════════════════════════════╝\n");
    
    // ========== LOAD SAVED TIME FROM NVS ==========
    Serial.println("→ Loading time from NVS...");
    bool timeRestored = loadTimeFromNVS();
    if (timeRestored) {
        Serial.println("   ✓ Time restored from previous sync");
    } else {
        Serial.println("   ⓘ Using default time (will sync from mobile app)");
    }
    Serial.println();
    
    // ========== INITIALIZE I2C BUS ==========
    Serial.println("→ Initializing I2C bus...");
    Serial.printf("   SDA: GPIO%d | SCL: GPIO%d\n", I2C_SDA, I2C_SCL);
    Serial.printf("   Clock: %lukHz\n", I2C_FREQ / 1000);
    
    Wire.begin(I2C_SDA, I2C_SCL);
    Wire.setClock(I2C_FREQ);
    delay(500);  // Longer delay for bus stabilization
    
    // Scan I2C bus to detect all devices
    Serial.println("\n→ Scanning I2C bus...");
    byte deviceCount = 0;
    for (byte addr = 1; addr < 127; addr++) {
        Wire.beginTransmission(addr);
        if (Wire.endTransmission() == 0) {
            Serial.printf("   ✓ Device found at 0x%02X\n", addr);
            deviceCount++;
        }
    }
    
    if (deviceCount == 0) {
        Serial.println("   ✗ NO I2C DEVICES FOUND!");
        Serial.println("   Check wiring and power!");
    } else {
        Serial.printf("   Found %d device(s)\n", deviceCount);
    }
    Serial.println();
    
    // ========== INITIALIZE BUZZER ==========
    Serial.println("→ Initializing buzzer...");
    buzzer.begin(BUZZER_PIN);
    Serial.println("   ✓ Buzzer ready\n");
    
    // ========== INITIALIZE OLED DISPLAY ==========
    Serial.println("→ Initializing OLED display...");
    oled.begin();
    delay(500);

    // ========== INITIALIZE PANIC BUTTON ==========
    Serial.println("→ Initializing panic button...");
    panicBtn.begin(PANIC_BUTTON_PIN);
    Serial.printf("   ✓ Panic button ready (Pin %d)\n\n", PANIC_BUTTON_PIN);

    // ========== INITIALIZE MAX30102 ==========
    Serial.println("→ Initializing MAX30102 heart rate sensor...");
    oled.drawStartup("Init MAX30102...");
    
    if (!hrSensor.begin()) {
        Serial.println("✗ MAX30102 FAILED!");
        oled.drawStartup("MAX FAILED!");
        delay(1000);
    } else {
        Serial.println("✓ MAX30102 ready");
    }
    delay(300);

    // ========== INITIALIZE MPU ==========
    Serial.println("\n→ Initializing MPU accelerometer...");
    oled.drawStartup("Init MPU...");
    
    if (!mpu.begin()) {
        Serial.println("✗ MPU FAILED!");
        oled.drawStartup("MPU FAILED!");
        delay(1000);
    } else {
        Serial.println("✓ MPU ready");
    }
    delay(300);

    // ========== INITIALIZE LM35 TEMPERATURE SENSOR ==========
    Serial.println("\n→ Initializing LM35 temperature sensor...");
    oled.drawStartup("Init LM35...");
    
    if (!tempSensor.begin(LM35_PIN)) {
        Serial.println("✗ LM35 WARNING: Check connection");
        oled.drawStartup("LM35 CHECK!");
        delay(1000);
    } else {
        Serial.println("✓ LM35 ready");
    }
    delay(300);

    // ========== INITIALIZE BATTERY MONITOR ==========
    Serial.println("\n→ Initializing battery monitor...");
    if (!battery.begin(VBAT_ADC_PIN, CHRG_PIN)) {
        Serial.println("✗ Battery monitor warning: check VBAT/CHRG wiring");
    } else {
        Serial.println("✓ Battery monitor ready");
    }
    delay(100);

    // ========== INITIALIZE BLE COMMUNICATION ==========
    oled.drawStartup("Init BLE...");
    bleComm.begin();

    Serial.println("\n╔═══════════════════════════════════════╗");
    Serial.println("║   HEALTH WATCH Initialized!           ║");
    Serial.println("║   Premium UI Core Engaged             ║");
    Serial.println("╚═══════════════════════════════════════╝\n");
    
    oled.drawStartup("");
    delay(1000);
}

void loop() {
    // ========== UPDATE PANIC BUTTON ==========
    panicBtn.update();
    
    // ========== CRITICAL: Update MAX30102 first with NO DELAYS ==========
    hrSensor.update();
    
    // Update other sensors (fast, non-blocking)
    mpu.update();
    tempSensor.update();
    battery.update();

    // Update time every second
    unsigned long currentTime = millis();
    if (currentTime - lastSecondTime >= 1000) {
        lastSecondTime = currentTime;
        currentSecond++;
        if (currentSecond >= 60) {
            currentSecond = 0;
            currentMinute++;
        }
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
            
            // Auto-save time to NVS every hour to preserve it
            saveTimeToNVS();
            Serial.println("[NVS] Auto-saved time at hour change");
        }
        if (currentHour >= 24) {
            currentHour = 0;
            currentDay++;
            if (currentDay > 30) { currentDay = 1; currentMonth++; }
            if (currentMonth > 12) { currentMonth = 1; currentYear++; }
        }
    }

    // Get sensor readings
    float hr = hrSensor.getHeartRate();
    float temp = tempSensor.getTemperature();  // In Fahrenheit
    
    // Update SPO2
    spo2Calc.update(hrSensor.getIR(), hrSensor.getRed());
    int currentSpO2 = spo2Calc.getSpO2();

    bool shaking = mpu.isShaking();
    bool fall = mpu.isFall();
    bool panic = panicBtn.isPanic();
    
    // Risk detection for buzzer warning
    bool inRisk = false;
    if (hr > 0) {
        if (hr < 40 || hr > 120) inRisk = true;
        if (temp > 104.0f || temp < 95.0f) inRisk = true;
        if (currentSpO2 > 0 && currentSpO2 < 90) inRisk = true;
    } else {
        temp = 0.0f;  // Don't show temp when no finger is detected
    }

    static unsigned long lastRiskBeep = 0;
    if (inRisk && millis() - lastRiskBeep > 2000) {
        buzzer.beep(200);
        lastRiskBeep = millis();
    }

    // Modernized Revamped Battery Display Formatting


    // Determine status string
    WatchStatus status;
    const char* statusStr = "NORMAL";
    
    if (fall) {
        status = STATUS_FALL;
        statusStr = "CRIT! FALL";
    } else if (shaking) {
        status = STATUS_SHAKING;
        statusStr = "SHAKE DETECT";
    } else {
        status = STATUS_OK;
    }
    
    // Prepare sensor data for BLE
    SensorData data;
    data.sensor1OK = hrSensor.sensorOK();
    data.sensor2OK = true; 
    data.sensor3OK = tempSensor.sensorOK(); 
    data.heartRate = (int)hr;
    data.temperature = temp;  
    data.spo2 = currentSpO2;  
    data.irValue = hrSensor.getIR();
    data.redValue = hrSensor.getRed();
    data.status = status;
    data.panic = panic;
    
    // Send data via BLE (throttled internally to 1 second)
    bleComm.sendData(data);

    // ========== ADVANCED RENDER PIPELINE WITH PANIC PRE-EMPTION ==========
    static unsigned long lastOLEDUpdate = 0;
    static bool lastPanicState = false;

    // Trigger frame update instantly if panic state shifts, otherwise throttle to 500ms
    if ((millis() - lastOLEDUpdate > 500) || (panic != lastPanicState)) {
        lastOLEDUpdate = millis();
        lastPanicState = panic;

        // Convert 24-hour to 12-hour format with AM/PM
        int displayHour = currentHour;
        bool isPM = false;
        
        if (displayHour >= 12) {
            isPM = true;
            if (displayHour > 12) displayHour -= 12;
        }
        if (displayHour == 0) displayHour = 12; 
        
        const char* ampm = isPM ? "PM" : "AM";
        
        oled.drawWatch(currentYear, currentMonth, currentDay, displayHour, currentMinute, currentSecond, hr, temp, currentSpO2, statusStr, battery.getPercentage(), battery.isCharging(), bleComm.isConnected(), panic, ampm);
    }

    // Serial debug output every 1 second
    static unsigned long lastSerialPrint = 0;
    if (millis() - lastSerialPrint > 1000) {
        Serial.print("[WATCH] Time: ");
        Serial.printf("%02d:%02d:%02d", currentHour, currentMinute, currentSecond);
        Serial.print(" | HR: ");
        Serial.print((int)hr);
        Serial.print(" BPM | Temp: ");
        Serial.print((int)temp);
        Serial.print("°F | BLE: ");
        Serial.print(bleComm.isConnected() ? "Connected" : "Waiting...");
        Serial.print(" | BAT: ");
        Serial.print(battery.getPercentage());
        Serial.print("%");
        Serial.print(" | PANIC: ");
        Serial.println(panic ? "SENT" : "OFF");
        lastSerialPrint = millis();
    }

    // ========== NO DELAY IN MAIN LOOP - CRITICAL FOR MAX30102 ==========
}