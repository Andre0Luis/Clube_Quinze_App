
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
import type { MockPersona } from '../services/mock/data';
import {
    getMockPersona,
    getMockPersonaCredentials,
    getMockPersonaOptions,
    setMockPersona as setMockPersonaSetting,
} from '../services/mock/data';
import { isMockEnabled, setMockEnabled } from '../services/mock/settings';

const mockPersonaOptions = getMockPersonaOptions();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(isMockEnabled());
  const [mockPersona, setMockPersonaState] = useState<MockPersona>(getMockPersona());
  const router = useRouter();

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  useEffect(() => {
    setMockEnabled(useMock);
    if (useMock) {
      const credentials = getMockPersonaCredentials(mockPersona);
      setEmail(credentials.email);
      setPassword(credentials.password);
    }
  }, [useMock, mockPersona]);

  useEffect(() => {
    setMockPersonaSetting(mockPersona);
  }, [mockPersona]);

  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      if (useMock) {
        return;
      }

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
  }, [router, useMock]);

  const handleToggleMock = () => {
    setUseMock((prev) => {
      const next = !prev;
      if (next) {
        SecureStore.deleteItemAsync('accessToken').catch(() => undefined);
        SecureStore.deleteItemAsync('refreshToken').catch(() => undefined);
      }
      return next;
    });
  };

  const handleSelectPersona = (persona: MockPersona) => {
    setMockPersonaState(persona);
    if (useMock) {
      const credentials = getMockPersonaCredentials(persona);
      setEmail(credentials.email);
      setPassword(credentials.password);
    }
  };

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

            <View style={styles.mockControls}>
              <View style={styles.mockHeaderRow}>
                <Text style={styles.mockLabel}>Perfil para mocks</Text>
                <Text style={styles.mockHint}>Escolha antes de ativar</Text>
              </View>
              <View style={styles.personaChips}>
                {mockPersonaOptions.map((option) => {
                  const isActive = mockPersona === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.personaChip, isActive ? styles.personaChipActive : null]}
                      onPress={() => handleSelectPersona(option.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar perfil ${option.label}`}
                    >
                      <Text style={[styles.personaChipLabel, isActive ? styles.personaChipLabelActive : null]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.personaChipSub, isActive ? styles.personaChipLabelActive : null]}>
                        {option.membershipTier === 'QUINZE_SELECT' ? 'Select' : 'Clube 15'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={[styles.mockToggle, useMock ? styles.mockToggleActive : null]}
        onPress={handleToggleMock}
        activeOpacity={0.85}
        accessibilityRole="switch"
        accessibilityState={{ checked: useMock }}
        accessibilityLabel="Alternar dados mockados"
      >
        <Ionicons name={useMock ? 'cloud-offline' : 'cloud-outline'} size={18} color={Color.mainGoten} />
        <Text style={styles.mockToggleText}>{useMock ? 'Mocks ativos' : 'Mocks inativos'}</Text>
      </TouchableOpacity>
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
  mockControls: {
    marginTop: StyleVariable.px6,
    padding: StyleVariable.px4,
    borderRadius: Border.br_16,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    gap: StyleVariable.px3,
  },
  mockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  mockHint: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  personaChips: {
    flexDirection: 'row',
    gap: StyleVariable.px2,
    flexWrap: 'wrap',
  },
  personaChip: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px3,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    gap: StyleVariable.px1,
  },
  personaChipActive: {
    borderColor: Color.piccolo,
    backgroundColor: 'rgba(28, 145, 214, 0.12)',
  },
  personaChipLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  personaChipLabelActive: {
    color: Color.piccolo,
  },
  personaChipSub: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  mockToggle: {
    position: 'absolute',
    right: Padding.padding_24,
    bottom: Padding.padding_24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: StyleVariable.gap1,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_16,
    backgroundColor: 'rgba(52, 59, 69, 0.85)',
  },
  mockToggleActive: {
    backgroundColor: Color.piccolo,
  },
  mockToggleText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
