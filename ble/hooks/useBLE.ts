import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

import { AvailableDevice, WatchData } from '../types';
import { SERVICE_UUID, CHAR_UUID, TIME_SYNC_UUID, SPO2_BUFFER_SIZE } from '../constants';
import { requestBluetoothPermissions } from '../utils/permissions';
import { parseWatchData } from '../utils/parser';
import { calculateSpO2 } from '../utils/calculate_spo2';

export const useBLE = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<AvailableDevice[]>([]);
  
  // Real-time JSON data updated every second
  const [watchData, setWatchData] = useState<WatchData>({
    heartRate: "--",
    spo2: "--",
    temperature: "--",
    maxSensorStatus: true,
    mpuSensorStatus: true,
    tempSensorStatus: true,
    watchStatus: null,
    panicActive: false,
    timestamp: Date.now()
  });

  const managerRef = useRef<BleManager | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const redBufferRef = useRef<number[]>([]);
  const irBufferRef = useRef<number[]>([]);
  
  const lastUpdateRef = useRef<number>(0);
  const latestWatchDataRef = useRef<WatchData>(watchData);

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (deviceRef.current) deviceRef.current.cancelConnection().catch(() => {});
      if (managerRef.current) managerRef.current.destroy();
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

      connectedDevice.onDisconnected(() => {
        console.log("Device disconnected");
        setIsConnected(false);
        const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
        latestWatchDataRef.current = resetData;
        setWatchData(resetData);
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
    }
  };

  const processIncomingData = (rawData: string) => {
    const parsed = parseWatchData(rawData) as any;
    if (!parsed) return;

    let calculatedSpO2 = latestWatchDataRef.current.spo2;
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

    // Trigger state update every 1 second
    const now = Date.now();
    if (now - lastUpdateRef.current >= 1000) {
      setWatchData(newWatchData);
      lastUpdateRef.current = now;
      console.log("Live Watch JSON Updated:", JSON.stringify(newWatchData));
    }
  };

  const sendTimeSync = async (device: Device) => {
    try {
      const now = new Date();
      const timeData = new Uint8Array([now.getHours(), now.getMinutes(), now.getSeconds()]);
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
      deviceRef.current.cancelConnection().catch(() => {});
      deviceRef.current = null;
      setIsConnected(false);
      const resetData = { ...latestWatchDataRef.current, heartRate: "--", spo2: "--", temperature: "--" };
      latestWatchDataRef.current = resetData;
      setWatchData(resetData);
    }
  };

  return {
    isScanning,
    isConnected,
    availableDevices,
    watchData,
    scanForDevices,
    connectToDevice,
    disconnect,
  };
};
