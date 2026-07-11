const path = require("path");
const RISK_MODEL = require(path.join(__dirname, "risk_model.json"));

function fahrenheitToCelsius(f) {
  return (f - 32) * 5 / 9;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// heartRateBpm: number
// spo2Percent: number
// tempFahrenheit: number  (your DB stores °F — this function converts internally)
function predictRisk(heartRateBpm, spo2Percent, tempFahrenheit) {
  const tempCelsius = fahrenheitToCelsius(tempFahrenheit);
  const raw = [heartRateBpm, spo2Percent, tempCelsius]; // must match RISK_MODEL.features order

  const z = raw.reduce((sum, value, i) => {
    const standardized = (value - RISK_MODEL.mean[i]) / RISK_MODEL.scale[i];
    return sum + standardized * RISK_MODEL.coef[i];
  }, RISK_MODEL.intercept);

  const probability = sigmoid(z);

  return {
    probability: Math.round(probability * 1000) / 1000,
    category: probability >= RISK_MODEL.threshold ? "High Risk" : "Low Risk",
  };
}

module.exports = { predictRisk, fahrenheitToCelsius };