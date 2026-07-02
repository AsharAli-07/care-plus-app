export const calculateSpO2 = (redBuffer: number[], irBuffer: number[]): number | null => {
  if (redBuffer.length === 0 || irBuffer.length === 0) return null;
  
  let redSum = 0;
  let irSum = 0;
  for (let i = 0; i < redBuffer.length; i++) {
    redSum += redBuffer[i];
    irSum += irBuffer[i];
  }
  
  const redAvg = redSum / redBuffer.length;
  const irAvg = irSum / irBuffer.length;
  
  if (irAvg < 50000) return null; // No finger detected
  
  // Basic mockup ratio for demonstration
  const ratio = redAvg / irAvg;
  let spo2 = 110 - 25 * ratio;
  
  if (spo2 > 100) spo2 = 100;
  if (spo2 < 50) spo2 = 50;
  
  return spo2;
};
