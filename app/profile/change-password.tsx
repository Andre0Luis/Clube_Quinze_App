import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, FontFamily, FontSize, Padding, Border, StyleVariable, Gap } from "../../GlobalStyles";
import { changePassword } from "../../services/auth";
import * as SecureStore from "expo-secure-store";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!currentPassword) newErrors.currentPassword = "Senha atual é obrigatória";
    if (!newPassword) newErrors.newPassword = "Nova senha é obrigatória";
    else if (newPassword.length < 6) newErrors.newPassword = "A nova senha deve ter pelo menos 6 caracteres";
    if (confirmPassword !== newPassword) newErrors.confirmPassword = "As senhas não coincidem";
    if (newPassword === currentPassword && newPassword !== "") newErrors.newPassword = "A nova senha deve ser diferente da atual";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Sucesso", "Senha alterada com sucesso! Você precisará logar novamente.", [
        { text: "OK", onPress: handleLogout }
      ]);
    } catch (error: any) {
      console.error("Change password error:", error);
      const message = error.response?.data?.message || "Erro ao alterar senha. Verifique se a senha atual está correta.";
      Alert.alert("Erro", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Senha</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha Atual</Text>
            <View style={[styles.passwordWrapper, errors.currentPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Digite sua senha atual"
                placeholderTextColor={Color.mainTrunks}
              />
              <TouchableOpacity onPress={() => setShowCurrent(p => !p)}>
                <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color={Color.mainTrunks} />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nova Senha</Text>
            <View style={[styles.passwordWrapper, errors.newPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Color.mainTrunks}
              />
              <TouchableOpacity onPress={() => setShowNew(p => !p)}>
                <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color={Color.mainTrunks} />
              </TouchableOpacity>
            </View>
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <View style={[styles.passwordWrapper, errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repita a nova senha"
                placeholderTextColor={Color.mainTrunks}
              />
              <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
                <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={Color.mainTrunks} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading ? styles.submitButtonDisabled : null]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Color.mainGoten} />
            ) : (
              <Text style={styles.submitButtonText}>Alterar Senha</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_16,
    gap: Gap.gap_16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  content: {
    padding: Padding.padding_24,
  },
  form: {
    gap: Gap.gap_24,
  },
  inputGroup: {
    gap: Gap.gap_8,
  },
  label: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: Padding.padding_16,
  },
  passwordInput: {
    flex: 1,
    color: Color.hit,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
  },
  inputError: {
    borderColor: Color.supportiveChichi,
  },
  errorText: {
    fontSize: FontSize.fs_12,
    color: Color.supportiveChichi,
    fontFamily: FontFamily.dMSansRegular,
  },
  submitButton: {
    height: 56,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Gap.gap_8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
