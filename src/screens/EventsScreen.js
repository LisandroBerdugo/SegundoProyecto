import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import {
  collection,
  getDocs
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));

      const eventos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setEvents(eventos);

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const cuposDisponibles =
      item.cupoMaximo - item.cupoReservado;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('DetalleEvento', {
            evento: item
          })
        }
      >
        <Text style={styles.title}>
          {item.nombre}
        </Text>

        <Text style={styles.text}>
          Lugar: {item.lugar}
        </Text>

        <Text style={styles.text}>
          Fecha: {item.fechaTexto}
        </Text>

        <Text style={styles.text}>
          Valor: ${item.valor}
        </Text>

        <Text style={styles.cupos}>
          Cupos disponibles: {cuposDisponibles}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#148F77" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#145A32'
  },
  text: {
    fontSize: 16,
    marginBottom: 6
  },
  cupos: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#148F77'
  }
});