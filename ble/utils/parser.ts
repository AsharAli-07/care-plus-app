import { WatchData, WatchStatus } from '../types';

export const parseWatchData = (dataStr: string): Partial<WatchData> | null => {
  if (!dataStr) return null;
  const cleanStr = dataStr.replace(/(\r\n|\n|\r)/gm, "");

  try {
    const jsonStr = cleanStr
      .replace(/(\w+):/g, '"$1":')
      .replace(/:(t|f)(?=[,\}])/g, ':"$1"');
    const data = JSON.parse(jsonStr);

    const parsed: Partial<WatchData> = {
      timestamp: Date.now(),
    };

    if (data.s1 !== undefined) parsed.maxSensorStatus = data.s1 === "t";
    if (data.s2 !== undefined) parsed.mpuSensorStatus = data.s2 === "t";
    if (data.s3 !== undefined) parsed.tempSensorStatus = data.s3 === "t";

    if (data.st !== undefined) {
      const parsedStatus = Number(data.st);
      if ([1, 2, 3].includes(parsedStatus)) {
        parsed.watchStatus = parsedStatus as WatchStatus;
      } else {
        parsed.watchStatus = null;
      }
    }

    if (data.p !== undefined) parsed.panicActive = (data.p === "t" || data.p === true);

    if (data.h !== undefined) {
      const hr = parseInt(data.h);
      parsed.heartRate = (hr > 0 && hr <= 250) ? hr.toString() : "--";
    }

    if (data.t !== undefined) {
      const temp = parseFloat(data.t);
      parsed.temperature = (temp > 0 && temp <= 115) ? temp.toFixed(1) : "--";
    }
    
    // We pass ir and red out so the hook can manage buffers and calculate SpO2
    return { ...parsed, _ir: data.ir, _red: data.red } as any;

  } catch (e) {
    console.log("Parse error:", e);
    return null;
  }
};
