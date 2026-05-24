import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

import { auth, db } from '../firebase/firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [personasCasa, setPersonasCasa] = useState('');
  const [houses, setHouses] = useState([]);
  const [casaSeleccionada, setCasaSeleccionada] = useState(null);

  useEffect(() => {
    cargarCasas();
  }, []);

  const cargarCasas = async () => {
    try {
      const housesRef = collection(db, 'houses');
      const snapshot = await getDocs(housesRef);

      const casas = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));

      setHouses(casas);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las casas');
    }
  };

  const registrarUsuario = async () => {
    if (!nombre || !email || !password || !personasCasa || !casaSeleccionada) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const cantidadPersonas = parseInt(personasCasa, 10);

    if (isNaN(cantidadPersonas) || cantidadPersonas <= 0) {
      Alert.alert('Error', 'La cantidad de personas debe ser mayor a 0');
      return;
    }

    try {
      const casaRef = doc(db, 'houses', casaSeleccionada.id);
      const casaSnap = await getDoc(casaRef);

      if (!casaSnap.exists()) {
        Alert.alert('Error', 'La casa seleccionada no existe');
        return;
      }

      const casaData = casaSnap.data();

      if (casaData.ocupada === true) {
        Alert.alert('Error', 'Esta casa ya tiene un usuario registrado');
        cargarCasas();
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        nombre,
        email,
        rol: 'usuario',
        casaId: casaSeleccionada.id,
        personasCasa: cantidadPersonas
      });

      await updateDoc(casaRef, {
        ocupada: true,
        userId: uid
      });

      Alert.alert('Éxito', 'Usuario registrado correctamente');

      navigation.replace('InicioUsuario');
    } catch (error) {
      Alert.alert('Error al registrar', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Personas que viven en la casa"
        value={personasCasa}
        onChangeText={setPersonasCasa}
        keyboardType="numeric"
      />

      <Text style={styles.subtitle}>Selecciona tu casa</Text>

      {houses.map((casa) => (
        <TouchableOpacity
          key={casa.id}
          style={[
            styles.houseItem,
            casaSeleccionada?.id === casa.id && styles.houseSelected,
            casa.ocupada && styles.houseDisabled
          ]}
          disabled={casa.ocupada}
          onPress={() => setCasaSeleccionada(casa)}
        >
          <Text style={styles.houseText}>
            {casa.direccion}
          </Text>

          <Text style={styles.houseStatus}>
            {casa.ocupada ? 'Ocupada' : 'Disponible'}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={registrarUsuario}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Ya tengo cuenta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#E8F6F3',
    flexGrow: 1
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#145A32',
    textAlign: 'center',
    marginBottom: 24
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#145A32',
    marginTop: 12,
    marginBottom: 12
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 14
  },
  houseItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10
  },
  houseSelected: {
    borderColor: '#148F77',
    borderWidth: 3
  },
  houseDisabled: {
    backgroundColor: '#ddd'
  },
  houseText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  houseStatus: {
    marginTop: 4,
    color: '#555'
  },
  button: {
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 8,
    marginTop: 18
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: '#117A65',
    fontWeight: 'bold'
  }
});