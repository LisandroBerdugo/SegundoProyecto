import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export default function MyTicketsScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    const q = query(
      collection(db, 'reservations'),
      where('usuarioId', '==', auth.currentUser.uid)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setReservas(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#148F77" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes boletos comprados.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CodigoQR', {
                reservaId: item.id
              })
            }
          >
            <Text style={styles.title}>{item.eventoNombre}</Text>
            <Text>Fecha: {item.eventoFecha}</Text>
            <Text>Total personas: {item.totalPersonas}</Text>
            <Text>Ingresadas: {item.personasIngresadas}</Text>
            <Text>Total pagado: ${item.totalPagar}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F6F3'
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    marginBottom: 14
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#145A32',
    marginBottom: 8
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16
  }
});