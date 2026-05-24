import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export default function HomeAdminScreen({ navigation }) {
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Administrador</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CrearEvento')}
      >
        <Text style={styles.buttonText}>Crear evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Eventos')}
      >
        <Text style={styles.buttonText}>Ver eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EscanearQR')}
      >
        <Text style={styles.buttonText}>Escanear QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#145A32',
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#C0392B',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});