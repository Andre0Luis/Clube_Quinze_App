
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import MaskInput from 'react-native-mask-input';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Animatable from 'react-native-animatable';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [membershipTier, setMembershipTier] = useState('CLUB_15');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const formattedDate = birthDate.toISOString().split('T')[0]; // yyyy-MM-dd

      const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
        name,
        email,
        password,
        phone,
        birthDate: formattedDate,
        membershipTier,
        planId: 1, // Hardcoded for now
      });

      if (response.status === 201) {
        const { accessToken, refreshToken } = response.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro no Cadastro', 'Ocorreu um erro inesperado.');
      }
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            if (error.response.data && error.response.data.message === 'Email already exists') {
                Alert.alert('Erro no Cadastro', 'Este e-mail já está em uso.');
            } else {
                Alert.alert('Erro no Cadastro', 'Dados inválidos, por favor verifique os campos.');
            }
        } else {
            Alert.alert('Erro no Cadastro', 'Não foi possível criar a conta, tente novamente.');
        }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  return (
    <View style={styles.container}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Cadastro</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.form}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="João"
          onChangeText={setName}
          value={name}
        />

        <Text style={styles.label}>Data de nascimento</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{birthDate.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="joao25@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="João*25"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <Text style={styles.label}>Telefone</Text>
        <MaskInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            placeholder="(99) 99999-9999"
        />

        <Text style={styles.label}>Plano</Text>
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={membershipTier}
                onValueChange={(itemValue) => setMembershipTier(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Club 15" value="CLUB_15" />
                <Picker.Item label="Quinze Select" value="QUINZE_SELECT" />
            </Picker>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400} style={styles.footer}>
        <Text style={styles.terms}>Ao "continuar", você concorda com os <Text style={styles.link}>Termos de Uso</Text> e a <Text style={styles.link}>Política de Privacidade do Clube Quinze.</Text></Text>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
      fontSize: 24,
      marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  form: {
      flex: 1,
  },
  label: {
      fontSize: 16,
      marginBottom: 5,
      color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  picker: {
      width: '100%',
  },
  footer: {
      paddingBottom: 20,
  },
  terms: {
      fontSize: 12,
      color: '#999',
      textAlign: 'center',
      marginBottom: 20,
  },
  link: {
      color: '#4B0082',
      textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
