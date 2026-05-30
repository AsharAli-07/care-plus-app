import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

export const CircleChart = ({ value }: { value: number }) => {
  const size = 50;
  const radius = 18;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle stroke="#ffffff" fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke="#004927ff"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progress}, ${circumference}`}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ position: "absolute", fontSize: 10, color: "#ffffff", fontFamily: "Poppins_400Regular" }}>
        {value}
      </Text>
    </View>
  );
};