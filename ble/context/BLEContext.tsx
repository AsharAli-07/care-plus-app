// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { Alert, Platform, NativeModules } from 'react-native';
// import { BleManager, Device } from 'react-native-ble-plx';
// import { Buffer } from 'buffer';
// import RNBluetoothClassic from 'react-native-bluetooth-classic';
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from '../../api';

// import { AvailableDevice, WatchData } from '../types';
// import { SERVICE_UUID, CHAR_UUID, TIME_SYNC_UUID, SPO2_BUFFER_SIZE,  MOVEMENT_DB_VALUES } from '../constants';
// import { requestBluetoothPermissions } from '../utils/permissions';
// import { parseWatchData } from '../utils/parser';
// import { calculateSpO2 } from '../utils/calculate_spo2';
// // import { SERVICE_UUID, CHAR_UUID, TIME_SYNC_UUID, SPO2_BUFFER_SIZE, MOVEMENT_DB_VALUES } from '../constants';

// const { BLEForegroundService } = NativeModules;

// interface BLEContextType {
//   isScanning: boolean;
//   isConnected: boolean;
//   availableDevices: AvailableDevice[];
//   watchData: WatchData;
//   scanForDevices: () => Promise<void>;
//   connectToDevice: (device: Device) => Promise<void>;
//   disconnect: () => void;
// }

// const defaultWatchData: WatchData = {
//   heartRate: "--",
//   spo2: "--",
//   temperature: "--",
//   maxSensorStatus: true,
//   mpuSensorStatus: true,
//   tempSensorStatus: true,
//   watchStatus: null,
//   panicActive: false,
//   timestamp: Date.now()
// };

// const BLEContext = createContext<BLEContextType>({
//   isScanning: false,
//   isConnected: false,
//   availableDevices: [],
//   watchData: defaultWatchData,
//   scanForDevices: async () => { },
//   connectToDevice: async () => { },
//   disconnect: () => { },
// });

// export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isScanning, setIsScanning] = useState<boolean>(false);
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [availableDevices, setAvailableDevices] = useState<AvailableDevice[]>([]);
//   const [watchData, setWatchData] = useState<WatchData>(defaultWatchData);
//   const SAVE_INTERVAL_MS = 60000;
//   const SIGNIFICANT_HR_DELTA = 15;
//   const SIGNIFICANT_SPO2_DELTA = 3;
//   const lastSavedRef = useRef<WatchData | null>(null);
//   const lastSaveTimeRef = useRef<number>(0);

//   const managerRef = useRef<BleManager | null>(null);
//   const deviceRef = useRef<Device | null>(null);
//   const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const redBufferRef = useRef<number[]>([]);
//   const irBufferRef = useRef<number[]>([]);

//   const lastUpdateRef = useRef<number>(0);
//   const latestWatchDataRef = useRef<WatchData>(defaultWatchData);

//   const startForegroundService = async () => {
//     if (Platform.OS === 'android' && BLEForegroundService) {
//       try {
//         await BLEForegroundService.startService();
//         console.log('BLE Foreground Service started');
//       } catch (e) {
//         console.log('Failed to start foreground service:', e);
//       }
//     }
//   };

// const shouldSaveNow = () => {
//   return Date.now() - lastSaveTimeRef.current >= SAVE_INTERVAL_MS;
// };

// const saveVitalsToBackend = async (data: WatchData) => {
//   if (data.heartRate === "--" || data.spo2 === "--" || data.temperature === "--") return;

//   try {
//     const token = await AsyncStorage.getItem("token");
//     if (!token) return;

//     const movementValue = data.watchStatus && MOVEMENT_DB_VALUES[data.watchStatus]
//       ? MOVEMENT_DB_VALUES[data.watchStatus]
//       : "still";

//     await axios.post(
//       `${BASE_URL}/health-monitoring`,
//       {
//         heart_rate_bpm: Math.round(parseFloat(data.heartRate)),
//         temperature_fahrenheit: parseFloat(data.temperature),
//         blood_oxygen_percent: Math.round(parseFloat(data.spo2)),
//         movement: movementValue,
//       },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     lastSaveTimeRef.current = Date.now();
//   } catch (err) {
//     console.log("Vitals save error:", err);
//   }
// };

//   const stopForegroundService = async () => {
//     if (Platform.OS === 'android' && BLEForegroundService) {
//       try {
//         await BLEForegroundService.stopService();
//         console.log('BLE Foreground Service stopped');
//       } catch (e) {
//         console.log('Failed to stop foreground service:', e);
//       }
//     }
//   };

//   useEffect(() => {
//     managerRef.current = new BleManager();
//     return () => {
//       if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
//       if (deviceRef.current) deviceRef.current.cancelConnection().catch(() => { });
//       if (managerRef.current) managerRef.current.destroy();
//       stopForegroundService();
//     };
//   }, []);

//   const scanForDevices = async () => {
//     if (!managerRef.current) return;

//     const hasPermission = await requestBluetoothPermissions();
//     if (!hasPermission) {
//       Alert.alert("Permission Error", "Bluetooth permissions are required.");
//       return;
//     }

//     const state = await managerRef.current.state();
//     if (state !== 'PoweredOn') {
//       try {
//         if (Platform.OS === 'android') {
//           const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
//           if (!enabled) {
//             Alert.alert("Bluetooth Off", "Please turn on Bluetooth.");
//             return;
//           }
//           await new Promise(r => setTimeout(r, 1000));
//         } else {
//           Alert.alert("Bluetooth Off", "Please turn on Bluetooth in Settings.");
//           return;
//         }
//       } catch (e) {
//         Alert.alert("Bluetooth Off", "Could not enable Bluetooth.");
//         return;
//       }
//     }

//     setIsScanning(true);
//     setAvailableDevices([]);

//     const foundDevices = new Map();

//     managerRef.current.startDeviceScan(null, null, (error, device) => {
//       if (error) {
//         console.log("Scan error:", error);
//         setIsScanning(false);
//         return;
//       }

//       if (device && device.name && device.name.includes("HEALTH_WATCH")) {
//         if (!foundDevices.has(device.id)) {
//           foundDevices.set(device.id, { id: device.id, name: device.name, device });
//           setAvailableDevices(Array.from(foundDevices.values()));
//         }
//       }
//     });

//     scanTimeoutRef.current = setTimeout(() => {
//       if (managerRef.current) managerRef.current.stopDeviceScan();
//       setIsScanning(false);
//       if (foundDevices.size === 0) {
//         Alert.alert("No Devices Found", "Make sure your HEALTH_WATCH is powered on.");
//       }
//     }, 10000);
//   };

//   const connectToDevice = async (device: Device) => {
//     if (!managerRef.current) return;

//     managerRef.current.stopDeviceScan();
//     setIsScanning(false);

//     try {
//       console.log("Connecting to:", device.name);
//       const connectedDevice = await device.connect();

//       await new Promise<void>(resolve => setTimeout(resolve, 500));
//       await connectedDevice.discoverAllServicesAndCharacteristics();

//       deviceRef.current = connectedDevice;
//       setIsConnected(true);

//       await startForegroundService();

//       connectedDevice.onDisconnected(() => {
//         console.log("Device disconnected");
//         setIsConnected(false);
//         const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
//         latestWatchDataRef.current = resetData;
//         setWatchData(resetData);
//         stopForegroundService();
//       });

//       if (Platform.OS === 'android') {
//         try {
//           await connectedDevice.requestMTU(512);
//           await new Promise(r => setTimeout(r, 500));
//         } catch (e) {
//           console.log("MTU request failed:", e);
//         }
//       }

//       await sendTimeSync(connectedDevice);

//       connectedDevice.monitorCharacteristicForService(
//         SERVICE_UUID,
//         CHAR_UUID,
//         (error, characteristic) => {
//           if (error) {
//             console.log("Monitor error:", error.message || error);
//             return;
//           }

//           if (characteristic?.value) {
//             const rawData = Buffer.from(characteristic.value, 'base64').toString('ascii');
//             processIncomingData(rawData);
//           }
//         }
//       );
//     } catch (error) {
//       console.log("Connection failed:", error);
//       Alert.alert("Connection Failed", "Could not connect to the watch. Please try again.");
//       setIsConnected(false);
//       stopForegroundService();
//     }
//   };

//   const processIncomingData = (rawData: string) => {
//     const parsed = parseWatchData(rawData) as any;
//     if (!parsed) return;

//     let calculatedSpO2 = parsed.spo2 !== undefined ? parsed.spo2 : latestWatchDataRef.current.spo2;
//     if (parsed._ir !== undefined && parsed._red !== undefined) {
//       const ir = parseInt(parsed._ir);
//       const red = parseInt(parsed._red);

//       if (ir > 50000) {
//         irBufferRef.current.push(ir);
//         redBufferRef.current.push(red);

//         if (irBufferRef.current.length > SPO2_BUFFER_SIZE) {
//           irBufferRef.current.shift();
//           redBufferRef.current.shift();
//         }

//         if (irBufferRef.current.length === SPO2_BUFFER_SIZE) {
//           const res = calculateSpO2(redBufferRef.current, irBufferRef.current);
//           if (res !== null) calculatedSpO2 = res.toFixed(1);
//         }
//       } else {
//         irBufferRef.current = [];
//         redBufferRef.current = [];
//         calculatedSpO2 = "--";
//       }
//     }

//     delete parsed._ir;
//     delete parsed._red;

//     const newWatchData = {
//       ...latestWatchDataRef.current,
//       ...parsed,
//       spo2: calculatedSpO2,
//       timestamp: Date.now()
//     };

//     latestWatchDataRef.current = newWatchData;

//     const now = Date.now();
//     if (now - lastUpdateRef.current >= 1000) {
//       setWatchData(newWatchData);
//       lastUpdateRef.current = now;
//     }

// if (shouldSaveNow()) {
//   saveVitalsToBackend(newWatchData);
// }
//   };

//   const sendTimeSync = async (device: Device) => {
//     try {
//       const now = new Date();
//       const yearOffset = now.getFullYear() - 2000;
//       const month = now.getMonth() + 1;
//       const day = now.getDate();
//       const hour = now.getHours();
//       const minute = now.getMinutes();
//       const second = now.getSeconds();

//       const timeData = new Uint8Array([yearOffset, month, day, hour, minute, second]);
//       const base64Data = Buffer.from(timeData).toString('base64');

//       await device.writeCharacteristicWithResponseForService(
//         SERVICE_UUID,
//         TIME_SYNC_UUID,
//         base64Data
//       );
//     } catch (error) {
//       console.log("Time sync failed:", error);
//     }
//   };

//   const disconnect = () => {
//     if (deviceRef.current) {
//       deviceRef.current.cancelConnection().catch(() => { });
//       deviceRef.current = null;
//       setIsConnected(false);
//       const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
//       latestWatchDataRef.current = resetData;
//       setWatchData(resetData);
//       stopForegroundService();
//     }
//   };

//   return (
//     <BLEContext.Provider value={{
//       isScanning,
//       isConnected,
//       availableDevices,
//       watchData,
//       scanForDevices,
//       connectToDevice,
//       disconnect,
//     }}>
//       {children}
//     </BLEContext.Provider>
//   );
// };

// export const useBLE = () => useContext(BLEContext);
// // Alias — other screens (Therapy.tsx, ConnectWatch.tsx) import `useBLEContext`.
// export const useBLEContext = useBLE;


import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert, Platform, NativeModules, Linking } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../../api';
import * as Notifications from 'expo-notifications';

import { AvailableDevice, WatchData } from '../types';
import { SERVICE_UUID, CHAR_UUID, TIME_SYNC_UUID, SPO2_BUFFER_SIZE,  MOVEMENT_DB_VALUES } from '../constants';
import { requestBluetoothPermissions } from '../utils/permissions';
import { parseWatchData } from '../utils/parser';
import { calculateSpO2 } from '../utils/calculate_spo2';
import { getLocation } from '../../utils/location';

const { BLEForegroundService } = NativeModules;

interface BLEContextType {
  isScanning: boolean;
  isConnected: boolean;
  availableDevices: AvailableDevice[];
  watchData: WatchData;
  scanForDevices: () => Promise<void>;
  connectToDevice: (device: Device) => Promise<void>;
  disconnect: () => void;
}

const defaultWatchData: WatchData = {
  heartRate: "--",
  spo2: "--",
  temperature: "--",
  maxSensorStatus: true,
  mpuSensorStatus: true,
  tempSensorStatus: true,
  watchStatus: null,
  panicActive: false,
  timestamp: Date.now()
};

const BLEContext = createContext<BLEContextType>({
  isScanning: false,
  isConnected: false,
  availableDevices: [],
  watchData: defaultWatchData,
  scanForDevices: async () => { },
  connectToDevice: async () => { },
  disconnect: () => { },
});

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<AvailableDevice[]>([]);
  const [watchData, setWatchData] = useState<WatchData>(defaultWatchData);
  const SAVE_INTERVAL_MS = 60000;
  const SIGNIFICANT_HR_DELTA = 15;
  const SIGNIFICANT_SPO2_DELTA = 3;
  const lastSavedRef = useRef<WatchData | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  const managerRef = useRef<BleManager | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const redBufferRef = useRef<number[]>([]);
  const irBufferRef = useRef<number[]>([]);

  const lastUpdateRef = useRef<number>(0);
  const latestWatchDataRef = useRef<WatchData>(defaultWatchData);

  // ── Panic button (watch) — edge-detection so it fires exactly once per
  // press, not on every re-render while panicActive stays true.
  const panicHandledRef = useRef<boolean>(false);
  const panicInFlightRef = useRef<boolean>(false);

  const startForegroundService = async () => {
    if (Platform.OS === 'android' && BLEForegroundService) {
      try {
        await BLEForegroundService.startService();
        console.log('BLE Foreground Service started');
      } catch (e) {
        console.log('Failed to start foreground service:', e);
      }
    }
  };

const shouldSaveNow = () => {
  return Date.now() - lastSaveTimeRef.current >= SAVE_INTERVAL_MS;
};

const saveVitalsToBackend = async (data: WatchData) => {
  if (data.heartRate === "--" || data.spo2 === "--" || data.temperature === "--") return;

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const movementValue = data.watchStatus && MOVEMENT_DB_VALUES[data.watchStatus]
      ? MOVEMENT_DB_VALUES[data.watchStatus]
      : "still";

    await axios.post(
      `${BASE_URL}/health-monitoring`,
      {
        heart_rate_bpm: Math.round(parseFloat(data.heartRate)),
        temperature_fahrenheit: parseFloat(data.temperature),
        blood_oxygen_percent: Math.round(parseFloat(data.spo2)),
        movement: movementValue,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    lastSaveTimeRef.current = Date.now();
  } catch (err) {
    console.log("Vitals save error:", err);
  }
};

  const stopForegroundService = async () => {
    if (Platform.OS === 'android' && BLEForegroundService) {
      try {
        await BLEForegroundService.stopService();
        console.log('BLE Foreground Service stopped');
      } catch (e) {
        console.log('Failed to stop foreground service:', e);
      }
    }
  };

  // ── Watch panic handler — mirrors Emergency.tsx's sendEmergencyEmail +
  // callContact, using the user's #1 priority favourite contact.
const triggerWatchPanic = async () => {
  if (panicInFlightRef.current) return;
  panicInFlightRef.current = true;

  // Fires immediately, no network needed — tells us definitively whether
  // the JS handler ran at all while backgrounded.
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Panic Detected", body: "Handler fired in background" },
      trigger: null,
    });
  } catch (e) {
    console.log("Notification error:", e);
  }

  try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("Watch panic: no auth token, skipping");
        return;
      }

      const res = await axios.get(`${BASE_URL}/favourite-contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contacts = res.data || [];
      const primaryContact = contacts[0] || null;

      if (!primaryContact) {
        console.log("Watch panic: no emergency contact configured");
        Alert.alert("No Emergency Contact", "Add an emergency contact to use panic alerts.");
        return;
      }

      const coords = await getLocation();

      // Email — same endpoint & payload shape as Emergency.tsx's emailContact
      if (primaryContact.email) {
        try {
          await axios.post(
            `${BASE_URL}/send-emergency-email`,
            {
              email: primaryContact.email,
              latitude: coords?.latitude,
              longitude: coords?.longitude,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.log("Watch panic: email send failed:", err);
        }
      }

      // Call — same as Emergency.tsx's callContact
      Linking.openURL(`tel:${primaryContact.phone}`);
    } catch (err) {
      console.log("Watch panic handler error:", err);
    } finally {
      panicInFlightRef.current = false;
    }
  };

  // Edge-detect panicActive: false -> true fires once; resets when the
  // watch clears the flag back to false, so the next press can fire again.
  useEffect(() => {
    if (watchData.panicActive && !panicHandledRef.current) {
      panicHandledRef.current = true;
      triggerWatchPanic();
    } else if (!watchData.panicActive) {
      panicHandledRef.current = false;
    }
  }, [watchData.panicActive]);

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (deviceRef.current) deviceRef.current.cancelConnection().catch(() => { });
      if (managerRef.current) managerRef.current.destroy();
      stopForegroundService();
    };
  }, []);

  const scanForDevices = async () => {
    if (!managerRef.current) return;

    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      Alert.alert("Permission Error", "Bluetooth permissions are required.");
      return;
    }

    const state = await managerRef.current.state();
    if (state !== 'PoweredOn') {
      try {
        if (Platform.OS === 'android') {
          const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
          if (!enabled) {
            Alert.alert("Bluetooth Off", "Please turn on Bluetooth.");
            return;
          }
          await new Promise(r => setTimeout(r, 1000));
        } else {
          Alert.alert("Bluetooth Off", "Please turn on Bluetooth in Settings.");
          return;
        }
      } catch (e) {
        Alert.alert("Bluetooth Off", "Could not enable Bluetooth.");
        return;
      }
    }

    setIsScanning(true);
    setAvailableDevices([]);

    const foundDevices = new Map();

    managerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setIsScanning(false);
        return;
      }

      if (device && device.name && device.name.includes("HEALTH_WATCH")) {
        if (!foundDevices.has(device.id)) {
          foundDevices.set(device.id, { id: device.id, name: device.name, device });
          setAvailableDevices(Array.from(foundDevices.values()));
        }
      }
    });

    scanTimeoutRef.current = setTimeout(() => {
      if (managerRef.current) managerRef.current.stopDeviceScan();
      setIsScanning(false);
      if (foundDevices.size === 0) {
        Alert.alert("No Devices Found", "Make sure your HEALTH_WATCH is powered on.");
      }
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
    if (!managerRef.current) return;

    managerRef.current.stopDeviceScan();
    setIsScanning(false);

    try {
      console.log("Connecting to:", device.name);
      const connectedDevice = await device.connect();

      await new Promise<void>(resolve => setTimeout(resolve, 500));
      await connectedDevice.discoverAllServicesAndCharacteristics();

      deviceRef.current = connectedDevice;
      setIsConnected(true);

      await startForegroundService();

      connectedDevice.onDisconnected(() => {
        console.log("Device disconnected");
        setIsConnected(false);
        const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
        latestWatchDataRef.current = resetData;
        setWatchData(resetData);
        stopForegroundService();
      });

      if (Platform.OS === 'android') {
        try {
          await connectedDevice.requestMTU(512);
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log("MTU request failed:", e);
        }
      }

      await sendTimeSync(connectedDevice);

      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Monitor error:", error.message || error);
            return;
          }

          if (characteristic?.value) {
            const rawData = Buffer.from(characteristic.value, 'base64').toString('ascii');
            processIncomingData(rawData);
          }
        }
      );
    } catch (error) {
      console.log("Connection failed:", error);
      Alert.alert("Connection Failed", "Could not connect to the watch. Please try again.");
      setIsConnected(false);
      stopForegroundService();
    }
  };

  const processIncomingData = (rawData: string) => {
    const parsed = parseWatchData(rawData) as any;
    if (!parsed) return;

    let calculatedSpO2 = parsed.spo2 !== undefined ? parsed.spo2 : latestWatchDataRef.current.spo2;
    if (parsed._ir !== undefined && parsed._red !== undefined) {
      const ir = parseInt(parsed._ir);
      const red = parseInt(parsed._red);

      if (ir > 50000) {
        irBufferRef.current.push(ir);
        redBufferRef.current.push(red);

        if (irBufferRef.current.length > SPO2_BUFFER_SIZE) {
          irBufferRef.current.shift();
          redBufferRef.current.shift();
        }

        if (irBufferRef.current.length === SPO2_BUFFER_SIZE) {
          const res = calculateSpO2(redBufferRef.current, irBufferRef.current);
          if (res !== null) calculatedSpO2 = res.toFixed(1);
        }
      } else {
        irBufferRef.current = [];
        redBufferRef.current = [];
        calculatedSpO2 = "--";
      }
    }

    delete parsed._ir;
    delete parsed._red;

    const newWatchData = {
      ...latestWatchDataRef.current,
      ...parsed,
      spo2: calculatedSpO2,
      timestamp: Date.now()
    };

    latestWatchDataRef.current = newWatchData;

    const now = Date.now();
    if (now - lastUpdateRef.current >= 1000) {
      setWatchData(newWatchData);
      lastUpdateRef.current = now;
    }

if (shouldSaveNow()) {
  saveVitalsToBackend(newWatchData);
}
  };

  const sendTimeSync = async (device: Device) => {
    try {
      const now = new Date();
      const yearOffset = now.getFullYear() - 2000;
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();

      const timeData = new Uint8Array([yearOffset, month, day, hour, minute, second]);
      const base64Data = Buffer.from(timeData).toString('base64');

      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TIME_SYNC_UUID,
        base64Data
      );
    } catch (error) {
      console.log("Time sync failed:", error);
    }
  };

  const disconnect = () => {
    if (deviceRef.current) {
      deviceRef.current.cancelConnection().catch(() => { });
      deviceRef.current = null;
      setIsConnected(false);
      const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
      latestWatchDataRef.current = resetData;
      setWatchData(resetData);
      stopForegroundService();
    }
  };

  return (
    <BLEContext.Provider value={{
      isScanning,
      isConnected,
      availableDevices,
      watchData,
      scanForDevices,
      connectToDevice,
      disconnect,
    }}>
      {children}
    </BLEContext.Provider>
  );
};

export const useBLE = () => useContext(BLEContext);
// Alias — other screens (Therapy.tsx, ConnectWatch.tsx) import `useBLEContext`.
export const useBLEContext = useBLE;