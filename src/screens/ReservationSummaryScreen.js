import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Modal
} from 'react-native';

import { auth, db } from '../firebase/firebaseConfig';
import {
  doc, getDoc, addDoc, collection,
  updateDoc, increment, Timestamp
} from 'firebase/firestore';

export default function ReservationSummaryScreen({ route, navigation }) {
  const { evento } = route.params;

  const [residentes, setResidentes] = useState('');
  const [invitados, setInvitados] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const uid = auth.currentUser.uid;
    const userSnap = await getDoc(doc(db, 'users', uid));

    if (userSnap.exists()) {
      setUsuario(userSnap.data());
    }
  };

  const validarDatos = () => {
    if (!usuario) {
      Alert.alert('Error', 'No se pudo cargar la información del usuario.');
      return false;
    }

    if (residentes === '' || invitados === '') {
      Alert.alert('Error', 'Completa residentes e invitados.');
      return false;
    }

    const residentesNum = parseInt(residentes, 10);
    const invitadosNum = parseInt(invitados, 10);

    if (isNaN(residentesNum) || isNaN(invitadosNum)) {
      Alert.alert('Error', 'Ingresa solo números.');
      return false;
    }

    if (residentesNum < 0 || invitadosNum < 0) {
      Alert.alert('Error', 'No puedes ingresar números negativos.');
      return false;
    }

    if (residentesNum > usuario.personasCasa) {
      Alert.alert(
        'Error',
        `Solo puedes registrar hasta ${usuario.personasCasa} residentes.`
      );
      return false;
    }

    const totalPersonas = residentesNum + invitadosNum;

    if (totalPersonas <= 0) {
      Alert.alert('Error', 'Debe asistir al menos una persona.');
      return false;
    }

    const cuposDisponibles = evento.cupoMaximo - evento.cupoReservado;

    if (totalPersonas > cuposDisponibles) {
      Alert.alert('Error', `Solo hay ${cuposDisponibles} cupos disponibles.`);
      return false;
    }

    return true;
  };

  const abrirResumen = () => {
    if (validarDatos()) {
      setModalVisible(true);
    }
  };

  const confirmarReserva = async () => {
    setModalVisible(false);

    const residentesNum = parseInt(residentes, 10);
    const invitadosNum = parseInt(invitados, 10);
    const totalPersonas = residentesNum + invitadosNum;

    const eventoRef = doc(db, 'events', evento.id);
    const eventoSnap = await getDoc(eventoRef);

    if (!eventoSnap.exists()) {
      Alert.alert('Error', 'El evento ya no existe.');
      return;
    }

    const eventoActual = eventoSnap.data();
    const totalPagar = totalPersonas * eventoActual.valor;

    try {
      const reservaRef = await addDoc(collection(db, 'reservations'), {
        eventoId: evento.id,
        eventoNombre: evento.nombre,
        eventoLugar: evento.lugar,
        eventoFecha: evento.fechaTexto,
        usuarioId: auth.currentUser.uid,
        casaId: usuario.casaId,
        residentes: residentesNum,
        invitados: invitadosNum,
        totalPersonas,
        valorEntrada: eventoActual.valor,
        totalPagar,
        personasIngresadas: 0,
        estado: 'activa',
        qrCode: '',
        creadoEn: Timestamp.now()
      });

      await updateDoc(doc(db, 'reservations', reservaRef.id), {
        qrCode: reservaRef.id
      });

      await updateDoc(eventoRef, {
        cupoReservado: increment(totalPersonas)
      });

      navigation.replace('CodigoQR', {
        reservaId: reservaRef.id
      });

    } catch (error) {
      Alert.alert('Error al reservar', error.message);
    }
  };

  const residentesNum = parseInt(residentes || '0', 10);
  const invitadosNum = parseInt(invitados || '0', 10);
  const totalPersonas = residentesNum + invitadosNum;
  const totalPagar = totalPersonas * evento.valor;
  const cuposDisponibles = evento.cupoMaximo - evento.cupoReservado;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen de reserva</Text>

      <Text style={styles.eventName}>{evento.nombre}</Text>
      <Text style={styles.text}>Lugar: {evento.lugar}</Text>
      <Text style={styles.text}>Fecha: {evento.fechaTexto}</Text>
      <Text style={styles.text}>Valor entrada: ${evento.valor}</Text>
      <Text style={styles.text}>Cupos disponibles: {cuposDisponibles}</Text>

      {usuario && (
        <Text style={styles.text}>
          Personas registradas en tu casa: {usuario.personasCasa}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Residentes que asistirán"
        value={residentes}
        onChangeText={setResidentes}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Invitados"
        value={invitados}
        onChangeText={setInvitados}
        keyboardType="numeric"
      />

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total personas: {totalPersonas}</Text>
        <Text style={styles.summaryText}>Total a pagar: ${totalPagar}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={abrirResumen}>
        <Text style={styles.buttonText}>Generar QR</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar compra</Text>

            <Text>Evento: {evento.nombre}</Text>
            <Text>Residentes: {residentesNum}</Text>
            <Text>Invitados: {invitadosNum}</Text>
            <Text>Total personas: {totalPersonas}</Text>
            <Text>Total a pagar: ${totalPagar}</Text>

            <TouchableOpacity style={styles.button} onPress={confirmarReserva}>
              <Text style={styles.buttonText}>Sí, confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Regresar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#E8F6F3'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#145A32',
    textAlign: 'center',
    marginBottom: 20
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#117A65'
  },
  text: {
    fontSize: 16,
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 14
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6
  },
  button: {
    backgroundColor: '#148F77',
    padding: 16,
    borderRadius: 8,
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#A93226',
    padding: 16,
    borderRadius: 8,
    marginTop: 12
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#145A32'
  }
});