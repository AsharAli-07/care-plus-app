/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/__mocks__/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          module: "commonjs",
          moduleResolution: "node",
          strict: false,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Mock React Native and Expo modules for Node test environment
    "^react-native$": "<rootDir>/__tests__/__mocks__/react-native.ts",
    "^react-native-webrtc$": "<rootDir>/__tests__/__mocks__/react-native-webrtc.ts",
    "^expo-speech$": "<rootDir>/__tests__/__mocks__/expo-speech.ts",
    "^@react-native-async-storage/async-storage$": "<rootDir>/__tests__/__mocks__/async-storage.ts",
    "^../api$": "<rootDir>/__tests__/__mocks__/api.ts",
  },
};
