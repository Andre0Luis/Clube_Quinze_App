
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Ionicons } from '@expo/vector-icons';

interface DecodedToken {
  name: string;
}

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          setUserName(decodedToken.name);
        } catch (error) {
          console.error('Failed to decode token', error);
          // Handle invalid token, maybe logout
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      // If no refresh token, just clear local data and redirect
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      router.replace('/splash');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/v1/auth/logout', {
        refreshToken,
      });
    } catch (error) {
      // Even if logout fails on the server, clear local data
      console.error('Logout failed', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      router.replace('/splash');
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName} 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

        <View style={styles.cardContainer}>
            <TouchableOpacity style={[styles.card, {backgroundColor: '#E8F0F2'}]} onPress={() => navigateTo('/schedule')}>
                <Ionicons name="calendar-outline" size={32} color="#3498db" />
                <Text style={styles.cardText}>Agendar horário</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, {backgroundColor: '#E8F0F2'}]} onPress={() => navigateTo('/appointments')}>
                <Ionicons name="list-outline" size={32} color="#3498db" />
                <Text style={styles.cardText}>Meus agendamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, {backgroundColor: '#E8F0F2'}]} onPress={() => navigateTo('/preferences')}>
                <Ionicons name="options-outline" size={32} color="#3498db" />
                <Text style={styles.cardText}>Preferências</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, {backgroundColor: '#E8F0F2'}]} onPress={() => navigateTo('/plan')}>
                <Ionicons name="card-outline" size={32} color="#3498db" />
                <Text style={styles.cardText}>Meu plano</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 150,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
