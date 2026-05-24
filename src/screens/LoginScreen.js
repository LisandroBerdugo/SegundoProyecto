import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebase/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mostrarErrorFirebase = (errorCode) => {
    if (errorCode === 'auth/invalid-email') {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
    } else if (errorCode === 'auth/user-not-found') {
      Alert.alert('Usuario no encontrado', 'No existe una cuenta con este correo.');
    } else if (errorCode === 'auth/wrong-password') {
      Alert.alert('Contraseña incorrecta', 'La contraseña ingresada no es correcta.');
    } else if (errorCode === 'auth/invalid-credential') {
      Alert.alert('Datos incorrectos', 'El correo o la contraseña no son correctos.');
    } else if (errorCode === 'auth/too-many-requests') {
      Alert.alert('Demasiados intentos', 'Espera unos minutos antes de intentar nuevamente.');
    } else {
      Alert.alert('Error al iniciar sesión', errorCode);
    }
  };

  const login = async () => {
    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio) {
      Alert.alert('Campo requerido', 'Ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      Alert.alert('Campo requerido', 'Ingresa tu contraseña.');
      return;
    }

    if (!emailLimpio.includes('@') || !emailLimpio.includes('.')) {
      Alert.alert('Correo inválido', 'El correo debe tener un formato válido.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailLimpio,
        password
      );

      const uid = userCredential.user.uid;

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert(
          'Usuario incompleto',
          'La cuenta existe en Authentication, pero no tiene datos en Firestore.'
        );
        return;
      }

      const userData = userSnap.data();

      if (!userData.rol) {
        Alert.alert('Error de rol', 'Este usuario no tiene rol asignado.');
        return;
      }

      if (userData.rol === 'admin') {
        navigation.replace('InicioAdmin');
      } else if (userData.rol === 'usuario') {
        navigation.replace('InicioUsuario');
      } else {
        Alert.alert('Rol inválido', `Rol no permitido: ${userData.rol}`);
      }

    } catch (error) {
      console.log('ERROR LOGIN:', error.code, error.message);
      mostrarErrorFirebase(error.code);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Comunitarios</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.link}>Crear cuenta de usuario</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F6F3',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#145A32',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#148F77',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: '#117A65',
    fontWeight: 'bold',
  },
});