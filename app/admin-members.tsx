import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Border, Color, FontFamily, FontSize, Gap, Padding, StyleVariable } from "../GlobalStyles";

export default function AdminMembersScreen() {
  const router = useRouter();
  const { tier } = useLocalSearchParams<{ tier?: string | string[] }>();

  const tierLabel = useMemo(() => {
    const resolved = Array.isArray(tier) ? tier[0] : tier;
    if (resolved === "QUINZE_SELECT") {
      return "Quinze Select";
    }
    return "Plano Standard";
  }, [tier]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={20} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membros - {tierLabel}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.placeholderCard}>
          <Ionicons name="people-outline" size={22} color={Color.piccolo} />
          <Text style={styles.placeholderTitle}>Listagem de membros</Text>
          <Text style={styles.placeholderText}>
            Exibiremos aqui os membros do {tierLabel} para gestao e contato. Integre o endpoint de listagem quando estiver disponivel.
          </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_16,
    gap: StyleVariable.gap1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5FF",
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_24,
    gap: Gap.gap_16,
  },
  placeholderCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
  },
  placeholderTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  placeholderText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
});
