import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Meditation = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Hello, this is a simple text page!
      </Text>
    </View>
  );
};

export default Meditation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});