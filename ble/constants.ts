export const SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
export const CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb";
export const TIME_SYNC_UUID = "00002a2b-0000-1000-8000-00805f9b34fb";



// export const WATCH_STATUS_LABELS: Record<number, string> = {
//   1: "OK",
//   2: "Shaking",
//   3: "Fall",
// };

export const WATCH_STATUS_LABELS: Record<number, string> = {
  1: "Still",
  2: "Moving",
  3: "Fall",
};

// Lowercase values matching the DB's movement ENUM('still','moving','fall')
export const MOVEMENT_DB_VALUES: Record<number, "still" | "moving" | "fall"> = {
  1: "still",
  2: "moving",
  3: "fall",
};

export const SPO2_BUFFER_SIZE = 25;
