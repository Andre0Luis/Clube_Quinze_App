import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { AxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
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
} from "react-native";
import * as Animatable from "react-native-animatable";
import MaskInput from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "../services/auth";
import type { MembershipTier, RegisterRequest } from "../types/api";

const MEMBERSHIP_OPTIONS: Array<{ label: string; value: MembershipTier }> = [
  { label: "Quinze Standard", value: "QUINZE_STANDARD" },
  { label: "Quinze Premium", value: "QUINZE_PREMIUM" },
  { label: "Quinze Select", value: "QUINZE_SELECT" },
];

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [membershipTier, setMembershipTier] =
    useState<MembershipTier>("QUINZE_STANDARD");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { fromAdmin } = useLocalSearchParams<{
    fromAdmin?: string | string[];
  }>();
  const isAdminFlow = Array.isArray(fromAdmin)
    ? fromAdmin.includes("1")
    : fromAdmin === "1";
  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 8 &&
    password === confirmPassword;

  const handleRegister = async () => {
    if (!isFormValid || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const formattedDate = birthDate.toISOString().split("T")[0];
      const phoneDigits = phone.replace(/\D/g, "");

      const payload: RegisterRequest = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        membershipTier,
        birthDate: formattedDate,
        phone: phoneDigits ? phoneDigits : undefined,
      };

      const authResponse = await register(payload);

      if (isAdminFlow) {
        Alert.alert(
          "Cadastro concluído",
          "Usuário criado com sucesso. Você continua logado como administrador.",
        );
        router.replace("/admin-members");
        return;
      }

      const { accessToken, refreshToken } = authResponse;

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      router.replace("/(tabs)");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const serverMessage = err.response?.data?.message;
      Alert.alert(
        "Erro no Cadastro",
        serverMessage ?? "Não foi possível criar a conta, tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      if (Platform.OS !== "ios") {
        setShowDatePicker(false);
      }
      return;
    }

    const currentDate = selectedDate || birthDate;
    setBirthDate(currentDate);
    setShowDatePicker(Platform.OS === "ios");
  };

  const handleConfirmBlur = () => {
    if (!confirmPassword.trim()) {
      setPasswordMismatch(false);
      return;
    }
    setPasswordMismatch(
      Boolean(password.trim()) && password !== confirmPassword,
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
              accessibilityRole="button"
              accessibilityLabel="Selecionar data de nascimento"
            >
              <Text>{birthDate.toLocaleDateString("pt-BR")}</Text>
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
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="João*25"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#4B0082"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Repita a senha"
                secureTextEntry={!showConfirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  if (passwordMismatch && password === value) {
                    setPasswordMismatch(false);
                  }
                }}
                onBlur={handleConfirmBlur}
                value={confirmPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? "Ocultar confirmacao de senha"
                    : "Mostrar confirmacao de senha"
                }
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#4B0082"
                />
              </TouchableOpacity>
            </View>
            {passwordMismatch ? (
              <Text style={styles.helperError}>
                As senhas precisam ser iguais.
              </Text>
            ) : null}

            <Text style={styles.label}>Telefone</Text>
            <MaskInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mask={[
                "(",
                /\d/,
                /\d/,
                ")",
                " ",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                /\d/,
                "-",
                /\d/,
                /\d/,
                /\d/,
                /\d/,
              ]}
              placeholder="(11) 96199-5531"
            />

            <Text style={styles.label}>Plano</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={membershipTier}
                onValueChange={(itemValue) => setMembershipTier(itemValue)}
                style={styles.picker}
              >
                {MEMBERSHIP_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={Platform.OS === 'ios' ? '#131416' : undefined}
                  />
                ))}
              </Picker>
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={400}
            style={styles.footer}
          >
            <Text style={styles.terms}>
              Ao "continuar", você concorda com os{" "}
              <Text style={styles.link}>Termos de Uso</Text> e a{" "}
              <Text style={styles.link}>
                Política de Privacidade do Clube Quinze.
              </Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                (!isFormValid || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Criando conta..." : "Continuar"}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 24,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    color: "#131416",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  passwordToggle: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  helperError: {
    color: "#D7263D",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
  },
  terms: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    color: "#4B0082",
    textDecorationLine: "underline",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#0A4DFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: "#b5b5b5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
