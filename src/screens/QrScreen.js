import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
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
    try {
      const reservaSnap = await getDoc(doc(db, 'reservations', reservaId));

      if (reservaSnap.exists()) {
        setReserva({
          id: reservaSnap.id,
          ...reservaSnap.data()
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la reserva.');
    }

    setLoading(false);
  };

  const descargarPDF = async () => {
    try {
      qrRef.current.toDataURL(async (qrData) => {
        const html = `
          <html>
            <body style="font-family: Arial; padding: 30px; background-color: #E8F6F3;">
              <div style="background: white; border-radius: 18px; overflow: hidden;">
                <div style="background: #148F77; padding: 25px; text-align: center; color: white;">
                  <h1>EVENTOS COMUNITARIOS</h1>
                  <p>Entrada digital</p>
                </div>

                <div style="padding: 30px; text-align: center;">
                  <h2 style="color:#145A32;">${reserva.eventoNombre}</h2>

                  <div style="background:#E8F6F3; padding:15px; border-radius:10px; margin-bottom:10px;">
                    <strong>Lugar:</strong><br/>
                    ${reserva.eventoLugar}
                  </div>

                  <div style="background:#E8F6F3; padding:15px; border-radius:10px; margin-bottom:10px;">
                    <strong>Fecha:</strong><br/>
                    ${reserva.eventoFecha}
                  </div>

                  <table style="width:100%; margin-top:20px;">
                    <tr>
                      <td style="background:#E8F6F3; padding:15px; border-radius:10px;">
                        <strong>Residentes</strong><br/>
                        <span style="font-size:28px; color:#145A32;">${reserva.residentes}</span>
                      </td>
                      <td style="background:#E8F6F3; padding:15px; border-radius:10px;">
                        <strong>Invitados</strong><br/>
                        <span style="font-size:28px; color:#145A32;">${reserva.invitados}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#E8F6F3; padding:15px; border-radius:10px;">
                        <strong>Total personas</strong><br/>
                        <span style="font-size:28px; color:#145A32;">${reserva.totalPersonas}</span>
                      </td>
                      <td style="background:#E8F6F3; padding:15px; border-radius:10px;">
                        <strong>Total pagado</strong><br/>
                        <span style="font-size:28px; color:#145A32;">$${reserva.totalPagar}</span>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 30px;">
                    <img 
                      src="data:image/png;base64,${qrData}" 
                      style="width: 230px; height: 230px;" 
                    />
                  </div>

                  <p style="font-size: 12px; color: #566573;">
                    Código reserva: ${reserva.id}
                  </p>

                  <p style="margin-top: 25px;">
                    Presente esta entrada al ingresar al evento.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `;

        const file = await Print.printToFileAsync({
          html,
          base64: false
        });

        await Sharing.shareAsync(file.uri);
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Entrada generada</Text>

      <View style={styles.ticket}>
        <View style={styles.header}>
          <Text style={styles.headerText}>EVENTOS COMUNITARIOS</Text>
          <Text style={styles.headerSubText}>Entrada digital</Text>
        </View>

        <View style={styles.ticketBody}>
          <Text style={styles.eventTitle}>{reserva.eventoNombre}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Lugar</Text>
            <Text style={styles.value}>{reserva.eventoLugar}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{reserva.eventoFecha}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.smallBox}>
              <Text style={styles.label}>Residentes</Text>
              <Text style={styles.bigValue}>{reserva.residentes}</Text>
            </View>

            <View style={styles.smallBox}>
              <Text style={styles.label}>Invitados</Text>
              <Text style={styles.bigValue}>{reserva.invitados}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.smallBox}>
              <Text style={styles.label}>Total personas</Text>
              <Text style={styles.bigValue}>{reserva.totalPersonas}</Text>
            </View>

            <View style={styles.smallBox}>
              <Text style={styles.label}>Total pagado</Text>
              <Text style={styles.bigValue}>${reserva.totalPagar}</Text>
            </View>
          </View>

          <View style={styles.qrBox}>
            <QRCode
              value={reserva.id}
              size={190}
              getRef={(ref) => (qrRef.current = ref)}
            />

            <Text style={styles.qrText}>Código reserva</Text>
            <Text style={styles.code}>{reserva.id}</Text>
          </View>

          <Text style={styles.footerText}>
            Presente esta entrada al ingresar al evento.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={descargarPDF}>
        <Text style={styles.buttonText}>Descargar PDF</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#E8F6F3',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40
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
    marginBottom: 16,
    textAlign: 'center'
  },
  ticket: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18
  },
  header: {
    backgroundColor: '#148F77',
    padding: 18,
    alignItems: 'center'
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  headerSubText: {
    color: '#D5F5E3',
    fontSize: 14,
    marginTop: 4
  },
  ticketBody: {
    padding: 18,
    alignItems: 'center'
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#145A32',
    textAlign: 'center',
    marginBottom: 16
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#E8F6F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  label: {
    fontSize: 12,
    color: '#566573',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  value: {
    fontSize: 16,
    color: '#1C2833',
    marginTop: 4
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 10
  },
  smallBox: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  bigValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#145A32',
    marginTop: 4
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#148F77',
    marginTop: 10
  },
  qrText: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#145A32'
  },
  code: {
    fontSize: 11,
    color: '#566573',
    marginTop: 4,
    textAlign: 'center'
  },
  footerText: {
    marginTop: 14,
    fontSize: 13,
    color: '#566573',
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10
  },
  secondaryButton: {
    backgroundColor: '#117A65',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});