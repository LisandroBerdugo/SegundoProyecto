import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeUserScreen from '../screens/HomeUserScreen';
import HomeAdminScreen from '../screens/HomeAdminScreen';
import EventsScreen from '../screens/EventsScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ReservationSummaryScreen from '../screens/ReservationSummaryScreen';
import QrScreen from '../screens/QrScreen';
import ScanQrScreen from '../screens/ScanQrScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegisterScreen} />
        <Stack.Screen name="InicioUsuario" component={HomeUserScreen} />
        <Stack.Screen name="InicioAdmin" component={HomeAdminScreen} />
        <Stack.Screen name="Eventos" component={EventsScreen} />
        <Stack.Screen name="CrearEvento" component={CreateEventScreen} />
        <Stack.Screen name="DetalleEvento" component={EventDetailScreen} />
        <Stack.Screen name="ResumenReserva" component={ReservationSummaryScreen} />
        <Stack.Screen name="CodigoQR" component={QrScreen} />
        <Stack.Screen name="EscanearQR" component={ScanQrScreen} />
        <Stack.Screen name="MisBoletos" component={MyTicketsScreen} />
        <Stack.Screen name="AcercaDe" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}