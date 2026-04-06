import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const RegisterStep1 = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>

      <TextInput placeholder="First Name" style={styles.input} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" style={styles.input} onChangeText={setLastName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Phone Number" style={styles.input} onChangeText={setPhone} />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Register2')}
      >
        <Text style={styles.btnText}>Next</Text>
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

export default RegisterStep1;