import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const RegisterStep2 = ({ navigation }: any) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  return (
    <View style={styles.container}>

      <TextInput placeholder="Age" style={styles.input} onChangeText={setAge} />
      <TextInput placeholder="Weight" style={styles.input} onChangeText={setWeight} />
      <TextInput placeholder="Height" style={styles.input} onChangeText={setHeight} />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Register3')}
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

export default RegisterStep2;