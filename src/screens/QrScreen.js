import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Platform, Alert
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export default function QrScreen({ route, navigation }) {
  const { reservaId } = route.params;
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef();

  useEffect(() => {
    cargarReserva();
  }, []);

  const cargarReserva = async () => {
    const reservaSnap = await getDoc(doc(db, 'reservations', reservaId));

    if (reservaSnap.exists()) {
      setReserva({
        id: reservaSnap.id,
        ...reservaSnap.data()
      });
    }

    setLoading(false);
  };

  const descargarQR = () => {
    qrRef.current.toDataURL(async (data) => {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${data}`;
        link.download = `qr_reserva_${reserva.id}.png`;
        link.click();
      } else {
        const fileUri = FileSystem.cacheDirectory + `qr_reserva_${reserva.id}.png`;

        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64
        });

        await Sharing.shareAsync(fileUri);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#148F77" />
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la reserva</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compra realizada</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{reserva.eventoNombre}</Text>
        <Text>Lugar: {reserva.eventoLugar}</Text>
        <Text>Fecha: {reserva.eventoFecha}</Text>
        <Text>Residentes: {reserva.residentes}</Text>
        <Text>Invitados: {reserva.invitados}</Text>
        <Text>Total personas: {reserva.totalPersonas}</Text>
        <Text>Total pagado: ${reserva.totalPagar}</Text>
      </View>

      <View style={styles.qrContainer}>
        <QRCode
          value={reserva.id}
          size={240}
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={descargarQR}>
        <Text style={styles.buttonText}>Descargar QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('MisBoletos')}
      >
        <Text style={styles.buttonText}>Ver mis boletos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Eventos')}
      >
        <Text style={styles.buttonText}>Volver a eventos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    alignItems: 'center',
    padding: 24
  },
  center: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#145A32',
    marginBottom: 18,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    borderRadius: 10,
    marginBottom: 18
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#145A32',
    marginBottom: 8
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 18
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12
  },
  secondaryButton: {
    backgroundColor: '#117A65',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});