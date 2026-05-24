import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

export default function EventDetailScreen({
  route,
  navigation
}) {
  const { evento } = route.params;

  const cuposDisponibles =
    evento.cupoMaximo - evento.cupoReservado;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {evento.nombre}
      </Text>

      <Text style={styles.text}>
        Lugar: {evento.lugar}
      </Text>

      <Text style={styles.text}>
        Fecha: {evento.fechaTexto}
      </Text>

      <Text style={styles.text}>
        Valor por entrada: ${evento.valor}
      </Text>

      <Text style={styles.text}>
        Cupo máximo: {evento.cupoMaximo}
      </Text>

      <Text style={styles.text}>
        Cupos disponibles: {cuposDisponibles}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('ResumenReserva', {
            evento
          })
        }
      >
        <Text style={styles.buttonText}>
          Reservar asistencia
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    padding: 24
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#145A32'
  },
  text: {
    fontSize: 18,
    marginBottom: 12
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    marginTop: 30
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});