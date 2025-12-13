import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    LineHeight,
    Padding,
    StyleVariable,
} from "../../GlobalStyles";

const openExternalLink = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
};

export default function PoliciesScreen() {
  const router = useRouter();

  const handleOpenEmail = useCallback(async () => {
    await openExternalLink("mailto:suporte@clubequinze.com");
  }, []);

  const handleOpenTerms = useCallback(async () => {
    await openExternalLink("https://clubequinze.com/termos");
  }, []);

  const handleOpenPrivacy = useCallback(async () => {
    await openExternalLink("https://clubequinze.com/privacidade");
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={20} color={Color.hit} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Termos e politicas</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compromisso com a seguranca</Text>
          <Text style={styles.paragraph}>
            Mantemos seus dados protegidos de acordo com as diretrizes da LGPD. Aqui voce encontra um resumo dos principais pontos das nossas politicas.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={Color.piccolo} />
            <Text style={styles.sectionTitle}>Termos de uso</Text>
          </View>
          <Text style={styles.paragraph}>
            Definimos como voce pode utilizar os servicos do Clube Quinze, incluindo regras de agendamento, comunicacao e limites de uso da plataforma.
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenTerms} activeOpacity={0.85}>
            <Text style={styles.linkText}>Abrir termos completos</Text>
            <Ionicons name="open-outline" size={16} color={Color.piccolo} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Color.piccolo} />
            <Text style={styles.sectionTitle}>Politica de privacidade</Text>
          </View>
          <Text style={styles.paragraph}>
            Explicamos como coletamos, tratamos e armazenamos suas informacoes pessoais, alem de suas opcoes para gerenciar consentimentos.
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenPrivacy} activeOpacity={0.85}>
            <Text style={styles.linkText}>Consultar documento</Text>
            <Ionicons name="open-outline" size={16} color={Color.piccolo} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle-outline" size={20} color={Color.piccolo} />
            <Text style={styles.sectionTitle}>Precisa de ajuda?</Text>
          </View>
          <Text style={styles.paragraph}>
            Se tiver duvidas ou quiser atualizar consentimentos especificos, nossa equipe de privacidade pode ajudar voce a qualquer momento.
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={handleOpenEmail} activeOpacity={0.85}>
            <Text style={styles.linkText}>Enviar email para suporte</Text>
            <Ionicons name="mail-outline" size={16} color={Color.piccolo} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  content: {
    paddingTop: Padding.padding_24,
    paddingBottom: Padding.padding_32,
    paddingHorizontal: Padding.padding_24,
    gap: Gap.gap_20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.mainGohan,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  card: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  sectionTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  paragraph: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  linkText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
});
