import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView
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
        <Text style={styles.permissionText}>
          Se necesita permiso para usar la cámara
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Dar permiso
          </Text>
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

    const disponibles =
      reserva.totalPersonas - reserva.personasIngresadas;

    if (cantidad > disponibles) {
      Alert.alert(
        'Error',
        `Solo quedan ${disponibles} entradas disponibles.`
      );
      return;
    }

    try {
      const nuevasIngresadas =
        reserva.personasIngresadas + cantidad;

      const nuevoEstado =
        nuevasIngresadas >= reserva.totalPersonas
          ? 'completada'
          : 'activa';

      await updateDoc(doc(db, 'reservations', reserva.id), {
        personasIngresadas: nuevasIngresadas,
        estado: nuevoEstado
      });

      setReserva({
        ...reserva,
        personasIngresadas: nuevasIngresadas,
        estado: nuevoEstado
      });

      setCantidadIngreso('');

      Alert.alert(
        'Ingreso registrado',
        `Ingresaron ${cantidad} personas correctamente.`
      );

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
    const disponibles =
      reserva.totalPersonas - reserva.personasIngresadas;

    const agotado = disponibles <= 0;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.title}>
          Validación de entrada
        </Text>

        <View style={styles.ticket}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              EVENTOS COMUNITARIOS
            </Text>

            <Text style={styles.headerSubText}>
              Control de acceso
            </Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.eventTitle}>
              {reserva.eventoNombre}
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.label}>Reserva</Text>
              <Text style={styles.value}>
                {reserva.id}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.label}>Casa</Text>
              <Text style={styles.value}>
                {reserva.casaId}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.smallBox}>
                <Text style={styles.label}>
                  Total pagado
                </Text>

                <Text style={styles.bigValue}>
                  {reserva.totalPersonas}
                </Text>
              </View>

              <View style={styles.smallBox}>
                <Text style={styles.label}>
                  Ya ingresaron
                </Text>

                <Text style={styles.bigValue}>
                  {reserva.personasIngresadas}
                </Text>
              </View>
            </View>

            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>
                Entradas disponibles
              </Text>

              <Text
                style={[
                  styles.statusValue,
                  agotado && styles.statusDanger
                ]}
              >
                {disponibles}
              </Text>
            </View>

            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>
                Estado
              </Text>

              <Text
                style={[
                  styles.statusText,
                  agotado
                    ? styles.completed
                    : styles.active
                ]}
              >
                {agotado
                  ? 'TODOS INGRESARON'
                  : 'ACTIVA'}
              </Text>
            </View>
          </View>
        </View>

        {agotado ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Todas las entradas de este QR ya fueron utilizadas.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cantidad que ingresa ahora"
              value={cantidadIngreso}
              onChangeText={setCantidadIngreso}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={registrarIngreso}
            >
              <Text style={styles.buttonText}>
                Registrar ingreso
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={reiniciarEscaneo}
        >
          <Text style={styles.buttonText}>
            Escanear otro QR
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr']
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarcodeScanned
        }
      />

      <View style={styles.overlay}>
        <Text style={styles.scanText}>
          Escanea el código QR
        </Text>
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

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#E8F6F3',
    padding: 20
  },

  center: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },

  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#145A32',
    marginBottom: 20
  },

  ticket: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20
  },

  header: {
    backgroundColor: '#148F77',
    padding: 18,
    alignItems: 'center'
  },

  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },

  headerSubText: {
    color: '#D5F5E3',
    marginTop: 4
  },

  body: {
    padding: 18
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#145A32',
    marginBottom: 18
  },

  infoBox: {
    backgroundColor: '#E8F6F3',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },

  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#566573',
    textTransform: 'uppercase'
  },

  value: {
    fontSize: 15,
    marginTop: 4
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },

  smallBox: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },

  bigValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#145A32',
    marginTop: 4
  },

  statusBox: {
    backgroundColor: '#F4F6F7',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#566573',
    textTransform: 'uppercase'
  },

  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#148F77',
    marginTop: 4
  },

  statusDanger: {
    color: '#C0392B'
  },

  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4
  },

  active: {
    color: '#148F77'
  },

  completed: {
    color: '#C0392B'
  },

  warningBox: {
    backgroundColor: '#FADBD8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20
  },

  warningText: {
    color: '#922B21',
    fontWeight: 'bold',
    textAlign: 'center'
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
    borderRadius: 8
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});