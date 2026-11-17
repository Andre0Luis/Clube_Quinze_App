import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Color, FontFamily, FontSize, LineHeight, Padding } from "../GlobalStyles";
import {
    getEnvironment,
    getStoredStagingKey,
    switchEnvironment,
    testConnection,
    type ConnectionInfo,
} from "../services/environment";
import { buildEnvironment, canUseEnvironment, type AppEnvironment } from "../services/environmentConfig";
import { getCurrentUser } from "../services/users";

/** Tela do admin para apontar o app para a produção ou para a homologação (servidor de testes com dados falsos). */
export default function AdminEnvironmentScreen() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [env, setEnv] = useState<AppEnvironment | null>(null);
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [result, setResult] = useState<ConnectionInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user?.role !== "CLUB_ADMIN") {
          setAllowed(false);
          router.replace("/");
          return;
        }
        setAllowed(true);
        setEnv(await getEnvironment());
        setKey((await getStoredStagingKey()) ?? "");
      } catch {
        setAllowed(false);
        router.replace("/");
      }
    })();
  }, [router]);

  const onStaging = env?.name === "staging";

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      setResult(await testConnection(buildEnvironment("staging", key)));
    } finally {
      setTesting(false);
    }
  };

  const doSwitch = async (target: "production" | "staging") => {
    setSwitching(true);
    try {
      await switchEnvironment(target, key);
      router.replace("/login");
    } catch {
      Alert.alert("Não foi possível trocar", "Tente novamente.");
    } finally {
      setSwitching(false);
    }
  };

  const handleSwitch = (target: "production" | "staging") => {
    if (!canUseEnvironment(target, key)) {
      Alert.alert("Chave necessária", "Informe a chave de acesso da homologação.");
      return;
    }
    Alert.alert(
      target === "staging" ? "Usar a homologação?" : "Voltar para a produção?",
      "Você será desconectado e precisará entrar de novo com uma conta do ambiente escolhido." +
        (target === "staging" ? " Lá os dados são de teste e nada é enviado de verdade aos clientes." : ""),
      [
        { text: "Voltar", style: "cancel" },
        { text: "Trocar de ambiente", onPress: () => void doSwitch(target) },
      ],
    );
  };

  if (allowed !== true || !env) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Color.piccolo} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={20} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Ambiente</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Aponte o app para a produção (clientes reais) ou para a homologação (servidor de testes, dados falsos). Ao trocar, você
          entra de novo com uma conta daquele ambiente.
        </Text>

        <View style={[styles.card, onStaging ? styles.cardStaging : null]}>
          <Text style={styles.label}>Ambiente atual</Text>
          <Text style={styles.current}>{env.label}</Text>
          <Text style={styles.muted}>{env.rootUrl}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Chave de acesso da homologação</Text>
          <TextInput
            style={styles.input}
            value={key}
            onChangeText={(t) => { setKey(t); setResult(null); }}
            placeholder="Cole a chave aqui"
            placeholderTextColor={Color.mainTrunks}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Text style={styles.muted}>Fica guardada só neste aparelho, em armazenamento seguro.</Text>

          <TouchableOpacity style={[styles.secondary, testing && styles.disabled]} onPress={handleTest} disabled={testing || !key.trim()}>
            {testing ? <ActivityIndicator size="small" color={Color.piccolo} /> : <Text style={styles.secondaryText}>Testar conexão com a homologação</Text>}
          </TouchableOpacity>
          {result ? (
            <Text style={[styles.result, { color: result.ok ? "#2E9E5B" : "#D7263D" }]}>{result.message}</Text>
          ) : null}
        </View>

        {onStaging ? (
          <TouchableOpacity style={[styles.primary, switching && styles.disabled]} onPress={() => handleSwitch("production")} disabled={switching}>
            <Text style={styles.primaryText}>Voltar para a produção</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.warning, switching && styles.disabled]} onPress={() => handleSwitch("staging")} disabled={switching}>
            <Text style={styles.primaryText}>Usar a homologação</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.mainGohan },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Padding.padding_24, paddingVertical: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: Color.mainGoten, borderWidth: 1, borderColor: Color.mainBeerus },
  title: { flex: 1, fontSize: FontSize.fs_24, lineHeight: LineHeight.lh_32, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  content: { paddingHorizontal: Padding.padding_24, paddingBottom: 48, gap: 14 },
  description: { fontSize: FontSize.fs_14, lineHeight: LineHeight.lh_24, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  card: { gap: 8, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Color.mainBeerus, backgroundColor: Color.mainGoten },
  cardStaging: { borderColor: "#E07B00", borderWidth: 2 },
  label: { fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  current: { fontSize: FontSize.fs_24, fontFamily: FontFamily.dMSansBold, color: Color.mainBulma },
  muted: { fontSize: FontSize.fs_12, color: Color.mainTrunks, fontFamily: FontFamily.dMSansRegular },
  input: { borderWidth: 1, borderColor: Color.mainBeerus, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Color.mainBulma, backgroundColor: Color.mainGohan },
  result: { fontSize: FontSize.fs_14, fontFamily: FontFamily.dMSansBold },
  primary: { alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: Color.piccolo },
  warning: { alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, backgroundColor: "#E07B00" },
  primaryText: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_16 },
  secondary: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Color.piccolo, backgroundColor: Color.mainGoten },
  secondaryText: { color: Color.piccolo, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14 },
  disabled: { opacity: 0.6 },
});
