// Mock for react-native
export default {};
export const Platform = { OS: "android" };
export const View = "View";
export const Text = "Text";
export const StyleSheet = { create: (s: any) => s, absoluteFill: {} };
export const Animated = {
  Value: class { constructor() {} },
  View: "Animated.View",
  timing: () => ({ start: () => {} }),
  loop: () => ({ start: () => {}, stop: () => {} }),
  sequence: () => ({}),
  parallel: () => ({}),
  delay: () => ({}),
};
export const TouchableOpacity = "TouchableOpacity";
export const StatusBar = "StatusBar";
export const ScrollView = "ScrollView";
export const Alert = { alert: jest.fn() };
export const ActivityIndicator = "ActivityIndicator";
export const ImageBackground = "ImageBackground";
export const TextInput = "TextInput";
export const KeyboardAvoidingView = "KeyboardAvoidingView";
export const Keyboard = { dismiss: jest.fn() };
