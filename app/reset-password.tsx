import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

import {
    Border,
    Color,
    FontFamily,
    FontSize,
    LineHeight,
    Padding,
    StyleVariable,
} from "../GlobalStyles";
import { resetPassword } from "../services/auth";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return (
      (tokenInput?.trim().length ?? 0) > 0 &&
      password.trim().length >= 8 &&
      password === confirmPassword
    );
  }, [tokenInput, password, confirmPassword]);

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert(
        "Dados incompletos",
        "Informe o token e uma nova senha com no mínimo 8 caracteres.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(tokenInput.trim(), password.trim());
      Alert.alert(
        "Senha atualizada",
        "Agora você já pode entrar com a nova senha.",
        [
          {
            text: "Ir para login",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Falha ao redefinir senha.";
      Alert.alert("Erro", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, isValid, password, router, tokenInput]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Ionicons name="refresh" size={32} color={Color.hit} />
              <Text style={styles.title}>Redefinir senha</Text>
              <Text style={styles.subtitle}>
                Cole o token recebido por email e defina uma nova senha.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Token</Text>
                <TextInput
                  style={styles.input}
                  placeholder="cole o token do email"
                  placeholderTextColor={Color.mainTrunks}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={tokenInput}
                  onChangeText={setTokenInput}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Nova senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mínimo 8 caracteres"
                  placeholderTextColor={Color.mainTrunks}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirmar senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="repita a nova senha"
                  placeholderTextColor={Color.mainTrunks}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isValid || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Color.mainGoten} />
                ) : (
                  <Text style={styles.submitButtonText}>Redefinir senha</Text>
                )}
              </TouchableOpacity>
            </View>
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    gap: StyleVariable.gap2,
    marginBottom: StyleVariable.px6,
  },
  title: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  form: {
    gap: StyleVariable.gap2,
  },
  field: {
    gap: StyleVariable.gap1,
  },
  label: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  input: {
    backgroundColor: Color.mainBeerus,
    borderRadius: Border.br_10,
    paddingHorizontal: Padding.padding_16,
    paddingVertical: Padding.padding_12,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
  },
  submitButton: {
    marginTop: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    backgroundColor: Color.piccolo,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Color.mainGoten,
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
  },
});
