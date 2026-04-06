import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HelpScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('ForgotEmail')}
      >
        <Text>Forgot Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text>Forgot Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Register1')}
      >
        <Text>Register First</Text>
      </TouchableOpacity>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    padding: 15,
    backgroundColor: '#e9fff4',
    marginBottom: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
});

export default HelpScreen;