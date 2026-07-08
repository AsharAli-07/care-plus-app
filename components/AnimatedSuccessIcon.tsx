import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AnimatedSuccessIconProps = {
  size?: number;
  color?: string;
};

const AnimatedSuccessIcon: React.FC<AnimatedSuccessIconProps> = ({
  size = 72,
  color = "#4ade80",
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pop animation
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Pulsing ring
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.4,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          width: size + 30,
          height: size + 30,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: size + 30,
            height: size + 30,
            borderRadius: (size + 30) / 2,
            borderColor: color,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        <Ionicons
          name="checkmark-circle"
          size={size}
          color={color}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
  },

  ring: {
    position: "absolute",
    borderWidth: 2,
  },
});

export default AnimatedSuccessIcon;