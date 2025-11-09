
import { Ionicons } from '@expo/vector-icons';
import type { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Border,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  Padding,
  StyleVariable,
} from '../GlobalStyles';
import { login } from '../services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token && isMounted) {
          router.replace('/(tabs)');
        }
      } catch {
        // ignore failed read; user stays on login
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async () => {
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
    const { accessToken, refreshToken } = await login({ email, password });

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

  router.replace('/(tabs)');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage = err.response?.data?.message;
      Alert.alert('Erro no Login', serverMessage ?? 'Credenciais inválidas, tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>Faça login para acessar o Clube Quinze</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@dominio.com"
                  placeholderTextColor={Color.mainTrunks}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  value={email}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={Color.mainTrunks}
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    value={password}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={Color.mainTrunks}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, (!isFormValid || isLoading) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.loginButtonText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/register')}>
              <Text style={styles.secondaryText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: StyleVariable.gap2,
    marginBottom: StyleVariable.px6,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: Border.br_24,
    marginBottom: StyleVariable.gap2,
  },
  title: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: 'center',
  },
  form: {
    gap: StyleVariable.px4,
  },
  field: {
    gap: StyleVariable.px2,
  },
  label: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    color: Color.mainBulma,
    fontFamily: FontFamily.dMSansRegular,
  },
  input: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
    backgroundColor: Color.mainGohan,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    paddingHorizontal: StyleVariable.px4,
    backgroundColor: Color.mainGohan,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: StyleVariable.py2,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
  },
  loginButton: {
    marginTop: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    backgroundColor: Color.piccolo,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: Color.mainBeerus,
  },
  loginButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  secondaryAction: {
    marginTop: StyleVariable.px4,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textDecorationLine: 'underline',
  },
});
