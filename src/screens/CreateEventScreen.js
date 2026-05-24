import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export default function CreateEventScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('');
  const [valor, setValor] = useState('');
  const [cupoMaximo, setCupoMaximo] = useState('');

  const crearEvento = async () => {
    if (
      !nombre ||
      !lugar ||
      !fecha ||
      !valor ||
      !cupoMaximo
    ) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      await addDoc(collection(db, 'events'), {
        nombre,
        lugar,
        fechaTexto: fecha,
        fecha: Timestamp.now(),
        valor: parseFloat(valor),
        cupoMaximo: parseInt(cupoMaximo),
        cupoReservado: 0,
        creadoPor: auth.currentUser.uid,
        estado: 'activo',
        creadoEn: Timestamp.now()
      });

      Alert.alert('Éxito', 'Evento creado correctamente');

      navigation.navigate('Eventos');

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del evento"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Lugar"
        value={lugar}
        onChangeText={setLugar}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha (Ej: 20/06/2026)"
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor de entrada"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Cupo máximo"
        value={cupoMaximo}
        onChangeText={setCupoMaximo}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={crearEvento}
      >
        <Text style={styles.buttonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#E8F6F3'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#145A32'
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});