import { Device } from 'react-native-ble-plx';

export type WatchStatus = 1 | 2 | 3;

export interface AvailableDevice {
  id: string;
  name?: string | null;
  device: Device;
}

export interface WatchData {
  heartRate: string;
  spo2: string;
  temperature: string;
  maxSensorStatus: boolean;
  mpuSensorStatus: boolean;
  tempSensorStatus: boolean;
  watchStatus: WatchStatus | null;
  panicActive: boolean;
  timestamp: number; // For 1-second update tracking
}
