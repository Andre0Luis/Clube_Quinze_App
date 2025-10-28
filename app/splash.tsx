
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, you can add any logic to run when the component mounts
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={1500}>
        <Image
          source={require('../assets/images/icon.png')} // Update with your logo path
          style={styles.logo}
        />
      </Animatable.View>
      <Animatable.View animation="fadeInUp" delay={500} style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.buttonText}>Cadastrar-se</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B0082',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 50,
  },
  buttonsContainer: {
    width: '80%',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#4B0082',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
