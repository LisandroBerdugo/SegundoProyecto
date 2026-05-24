import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export default function ScanQrScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [reserva, setReserva] = useState(null);
  const [cantidadIngreso, setCantidadIngreso] = useState('');

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Se necesita permiso para usar la cámara.</Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const buscarReserva = async (reservaId) => {
    try {
      const reservaRef = doc(db, 'reservations', reservaId);
      const reservaSnap = await getDoc(reservaRef);

      if (!reservaSnap.exists()) {
        Alert.alert('Error', 'Reserva no encontrada.');
        setScanned(false);
        return;
      }

      setReserva({
        id: reservaSnap.id,
        ...reservaSnap.data()
      });
    } catch (error) {
      Alert.alert('Error', error.message);
      setScanned(false);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    buscarReserva(data);
  };

  const registrarIngreso = async () => {
    const cantidad = parseInt(cantidadIngreso, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida.');
      return;
    }

    const disponibles = reserva.totalPersonas - reserva.personasIngresadas;

    if (cantidad > disponibles) {
      Alert.alert('Error', `Solo quedan ${disponibles} entradas disponibles.`);
      return;
    }

    try {
      const nuevasIngresadas = reserva.personasIngresadas + cantidad;

      await updateDoc(doc(db, 'reservations', reserva.id), {
        personasIngresadas: nuevasIngresadas,
        estado:
          nuevasIngresadas >= reserva.totalPersonas
            ? 'completada'
            : 'activa'
      });

      setReserva({
        ...reserva,
        personasIngresadas: nuevasIngresadas,
        estado:
          nuevasIngresadas >= reserva.totalPersonas
            ? 'completada'
            : 'activa'
      });

      setCantidadIngreso('');

      Alert.alert('Éxito', 'Ingreso registrado correctamente.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const reiniciarEscaneo = () => {
    setReserva(null);
    setCantidadIngreso('');
    setScanned(false);
  };

  if (reserva) {
    const disponibles = reserva.totalPersonas - reserva.personasIngresadas;
    const agotado = disponibles <= 0;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Validar ingreso</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{reserva.eventoNombre}</Text>
          <Text>Reserva: {reserva.id}</Text>
          <Text>Casa: {reserva.casaId}</Text>
          <Text>Total pagado: {reserva.totalPersonas}</Text>
          <Text>Ya ingresaron: {reserva.personasIngresadas}</Text>
          <Text>Disponibles: {disponibles}</Text>
          <Text>Estado: {reserva.estado}</Text>
        </View>

        {agotado ? (
          <Text style={styles.warning}>
            Todos los asistentes de este QR ya ingresaron.
          </Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cantidad que ingresa ahora"
              value={cantidadIngreso}
              onChangeText={setCantidadIngreso}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={registrarIngreso}>
              <Text style={styles.buttonText}>Registrar ingreso</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={reiniciarEscaneo}>
          <Text style={styles.buttonText}>Escanear otro QR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr']
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.scanText}>Escanea el código QR</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center'
  },
  scanText: {
    backgroundColor: '#000',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontWeight: 'bold'
  },
  center: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#145A32',
    textAlign: 'center',
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#145A32',
    marginBottom: 10
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
    marginBottom: 12
  },
  secondaryButton: {
    backgroundColor: '#117A65',
    padding: 16,
    borderRadius: 8,
    marginTop: 12
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  warning: {
    backgroundColor: '#FADBD8',
    color: '#922B21',
    padding: 14,
    borderRadius: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});