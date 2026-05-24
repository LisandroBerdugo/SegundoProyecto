import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

export default function HomeAdminScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Administrador</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CrearEvento')}
      >
        <Text style={styles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Eventos')}
      >
        <Text style={styles.buttonText}>Ver Eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate('EscanearQR')}
>
  <Text style={styles.buttonText}>Escanear QR</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#145A32'
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});