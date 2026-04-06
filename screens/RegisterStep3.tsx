import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const RegisterStep3 = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Final submit logic here
    alert('Registered Successfully 🎉');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>

      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
      <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} onChangeText={setConfirmPassword} />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleRegister}
      >
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#e9fff4',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
  },
  btn: {
    backgroundColor: '#045d33',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
  },
});

export default RegisterStep3;