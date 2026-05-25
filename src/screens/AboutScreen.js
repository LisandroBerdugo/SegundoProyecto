import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity
} from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Eventos Comunitarios
      </Text>

      <Text style={styles.subtitle}>
        Segundo proyecto 
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Autor</Text>
        <Text style={styles.text}>
          Lisandro Rafael Berdugo Artiga BA131462
        </Text>

        <Text style={styles.label}>Tecnologías</Text>
        <Text style={styles.text}>
          React Native, Expo y Firebase
        </Text>

        <Text style={styles.label}>
          Licencia Creative Commons
        </Text>

        <Text style={styles.text}>
          Este proyecto está bajo la licencia:
        </Text>

        <Text style={styles.license}>
          CC BY-NC 4.0
        </Text>

        <Text style={styles.text}>
          Attribution-NonCommercial 4.0 International
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Linking.openURL(
              'https://creativecommons.org/licenses/by-nc/4.0/'
            )
          }
        >
          <Text style={styles.buttonText}>
            Ver licencia
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E8F6F3',
    padding: 24,
    justifyContent: 'center'
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#145A32'
  },

  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#566573'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#145A32',
    marginTop: 14
  },

  text: {
    fontSize: 16,
    marginTop: 4,
    color: '#1C2833'
  },

  license: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#148F77',
    marginTop: 10
  },

  button: {
    backgroundColor: '#148F77',
    padding: 14,
    borderRadius: 8,
    marginTop: 24
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});