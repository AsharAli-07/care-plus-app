const { predictRisk } = require("./predictRisk");   // ← changed from "./ml/predictRisk"

const heartRate = 62.0;
const spo2 = 96.29565239912247;
const tempCelsius = 36.168682029314894;

const tempFahrenheit = tempCelsius * 9/5 + 32;

const result = predictRisk(heartRate, spo2, tempFahrenheit);

console.log("Node result:", result);
console.log("Expected probability (from Colab):", 0.2480406626491937);