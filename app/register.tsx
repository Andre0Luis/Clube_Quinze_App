import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import type { AxiosError } from "axios";
import { useRouter } from "expo-router";
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
import { upsertPreference } from "../services/preferences";
import type { RegisterRequest } from "../types/api";

const MEMBERSHIP_OPTIONS = [
  { label: "Club 15", value: "CLUB_15" },
  { label: "Quinze Select", value: "QUINZE_SELECT" },
] as const;

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequencyDays, setFrequencyDays] = useState<"7" | "15">("7");
  const [frequencyTime, setFrequencyTime] = useState(() => {
    const seed = new Date();
    seed.setHours(9, 0, 0, 0);
    return seed;
  });
  const [membershipTier, setMembershipTier] = useState<
    "CLUB_15" | "QUINZE_SELECT"
  >("CLUB_15");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 8;

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
        password,
        membershipTier,
        birthDate: formattedDate,
        phone: phoneDigits ? phoneDigits : undefined,
      };

      const { accessToken, refreshToken } = await register(payload);

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      const timeLabel = `${frequencyTime.getHours().toString().padStart(2, "0")}:${frequencyTime.getMinutes().toString().padStart(2, "0")}`;
      void Promise.allSettled([
        upsertPreference({ key: "frequency_days", value: frequencyDays }),
        upsertPreference({ key: "frequency_time", value: timeLabel }),
      ]);

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

  const onTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      if (Platform.OS !== "ios") {
        setShowTimePicker(false);
      }
      return;
    }
    const current = selected || frequencyTime;
    setFrequencyTime(current);
    setShowTimePicker(Platform.OS === "ios");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
              placeholder="(99) 99999-9999"
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
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Frequencia de atendimento</Text>
            <View style={styles.frequencyRow}>
              <TouchableOpacity
                style={[
                  styles.frequencyChip,
                  frequencyDays === "7" && styles.frequencyChipActive,
                ]}
                onPress={() => setFrequencyDays("7")}
              >
                <Text
                  style={[
                    styles.frequencyChipText,
                    frequencyDays === "7" && styles.frequencyChipTextActive,
                  ]}
                >
                  1 vez / 7 dias
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyChip,
                  frequencyDays === "15" && styles.frequencyChipActive,
                ]}
                onPress={() => setFrequencyDays("15")}
              >
                <Text
                  style={[
                    styles.frequencyChipText,
                    frequencyDays === "15" && styles.frequencyChipTextActive,
                  ]}
                >
                  1 vez / 15 dias
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Horario preferido</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.input}
              accessibilityRole="button"
              accessibilityLabel="Selecionar horario preferido"
            >
              <Text>
                {frequencyTime.getHours().toString().padStart(2, "0")}:
                {frequencyTime.getMinutes().toString().padStart(2, "0")}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={frequencyTime}
                mode="time"
                is24Hour
                display="default"
                onChange={onTimeChange}
              />
            )}
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
    paddingBottom: 32,
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
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  frequencyChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  frequencyChipActive: {
    borderColor: "#4B0082",
    backgroundColor: "#f2e9ff",
  },
  frequencyChipText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  frequencyChipTextActive: {
    color: "#4B0082",
    fontWeight: "bold",
  },
  footer: {
    paddingBottom: 24,
    gap: 16,
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
    backgroundColor: "#4B0082",
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
