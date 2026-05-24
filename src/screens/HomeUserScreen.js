import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeUserScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Usuario</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Eventos')}
      >
        <Text style={styles.buttonText}>Ver eventos disponibles</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate('MisBoletos')}
>
  <Text style={styles.buttonText}>Mis boletos</Text>
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
  buttonSecondary: {
    backgroundColor: '#7DCEA0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});