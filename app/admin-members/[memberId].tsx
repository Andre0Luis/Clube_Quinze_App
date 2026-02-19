import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
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
    Padding,
    StyleVariable,
} from "../../GlobalStyles";
import AdminNavbar from "../../components/admin-navbar";
import { findMemberById } from "../admin-members.data";

type RenewValue = "1m" | "3m" | "6m" | "12m";

const photoPlaceholders = [{ id: 1 }, { id: 2 }, { id: 3 }];

const renewOptions: Array<{ label: string; value: RenewValue }> = [
  { label: "1 mês", value: "1m" },
  { label: "3 meses", value: "3m" },
  { label: "6 meses", value: "6m" },
  { label: "1 ano", value: "12m" },
];

export default function AdminMemberDetailScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();

  const [renewVisible, setRenewVisible] = useState(false);
  const [renewSelection, setRenewSelection] = useState<RenewValue>("1m");

  const member = useMemo(() => {
    const idNumber = Number(memberId);
    if (Number.isNaN(idNumber)) return undefined;
    return findMemberById(idNumber);
  }, [memberId]);

  const derived = useMemo(() => {
    if (!member) {
      return {
        name: "",
        email: "",
        idade: "",
        preferencias: "",
        agendamentoStatus: "",
        planoLabel: "",
        userStatus: "",
        vencimento: "",
      };
    }

    const slug = member.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "");
    const email = `${slug || "membro"}@quinze.com`;
    const idade = `${25 + (member.id % 15)} anos`;
    const preferencias =
      member.membershipTier === "QUINZE_SELECT"
        ? "Horários premium, massagem"
        : "Horários flexíveis, academia";
    const agendamentoStatus =
      member.id % 2 === 0
        ? "Próximo atendimento agendado"
        : "Sem próximo atendimento";
    const planoLabel =
      member.membershipTier === "QUINZE_SELECT"
        ? "Quinze Select"
        : "Clube Quinze";
    const userStatus = member.id % 3 === 0 ? "Cancelado" : "Ativo";
    const vencimento = "12/12/2026";

    return {
      name: member.name,
      email,
      idade,
      preferencias,
      agendamentoStatus,
      planoLabel,
      userStatus,
      vencimento,
    };
  }, [member]);

  const handleOpenRenew = () => {
    setRenewSelection("1m");
    setRenewVisible(true);
  };

  const handleConfirmRenew = () => {
    const picked = renewOptions.find((opt) => opt.value === renewSelection);
    setRenewVisible(false);
    if (picked) {
      Alert.alert("Renovação", `Renovar por ${picked.label}`);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={18} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!member ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={Color.supportiveChichi}
            />
            <Text style={styles.emptyTitle}>Membro não encontrado</Text>
            <Text style={styles.emptyText}>
              Verifique a listagem e tente novamente.
            </Text>
          </View>
        ) : (
          <View style={styles.detailWrapper}>
            <View style={styles.centerBlock}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeLabel}>
                  {member.avatarInitials}
                </Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberPlan}>{member.roleLabel}</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.cardTitle}>Dados pessoais</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Idade</Text>
                  <Text style={styles.infoValue}>{derived.idade}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{derived.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Preferências</Text>
                  <Text style={styles.infoValue}>{derived.preferencias}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>
                    {derived.agendamentoStatus}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.cardTitle}>Plano</Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{derived.userStatus}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Plano</Text>
                  <Text style={styles.infoValue}>{derived.planoLabel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vencimento</Text>
                  <Text style={styles.infoValue}>{derived.vencimento}</Text>
                </View>
                <TouchableOpacity
                  style={styles.renewButton}
                  activeOpacity={0.85}
                  onPress={handleOpenRenew}
                >
                  <Text style={styles.renewButtonText}>Fazer Renovação</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.cardTitle}>Fotos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {photoPlaceholders.map((item) => (
                  <View key={item.id} style={styles.photoCard}>
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={Color.mainTrunks}
                    />
                    <Text style={styles.photoLabel}>Foto {item.id}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={renewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenewVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setRenewVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Renovar plano</Text>
            <Text style={styles.modalSubtitle}>
              Escolha por quanto tempo deseja renovar
            </Text>

            <View style={styles.optionGrid}>
              {renewOptions.map((opt) => {
                const active = renewSelection === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionButton,
                      active && styles.optionButtonActive,
                    ]}
                    onPress={() => setRenewSelection(opt.value)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setRenewVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleConfirmRenew}
                activeOpacity={0.9}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <AdminNavbar activePath={pathname} />
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
    paddingBottom: 120,
    gap: Gap.gap_16,
  },
  emptyCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  emptyText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  detailWrapper: {
    gap: Gap.gap_20,
  },
  centerBlock: {
    alignItems: "center",
    gap: Gap.gap_8,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  avatarLargeLabel: {
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  memberName: {
    fontSize: FontSize.fs_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  memberPlan: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  sectionBlock: {
    gap: Gap.gap_8,
  },
  cardTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  card: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_12,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.gap_12,
  },
  infoLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    flex: 1,
    textAlign: "right",
  },
  renewButton: {
    marginTop: Gap.gap_4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: Color.piccolo,
    alignItems: "center",
  },
  renewButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  photoRow: {
    gap: Gap.gap_12,
  },
  photoCard: {
    width: 120,
    height: 120,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: "#F3F5FA",
    alignItems: "center",
    justifyContent: "center",
    gap: Gap.gap_8,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  photoLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
  },
  modalCard: {
    width: "92%",
    maxWidth: 520,
    alignSelf: "center",
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  modalSubtitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Gap.gap_8,
    width: "100%",
    justifyContent: "center",
  },
  optionButton: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px3,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
    minWidth: 120,
  },
  optionButtonActive: {
    borderColor: Color.piccolo,
    backgroundColor: "#EEF2FF",
  },
  optionLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  optionLabelActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Gap.gap_12,
    marginTop: Gap.gap_4,
  },
  modalCancel: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
  },
  modalCancelText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  modalConfirm: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_10,
    backgroundColor: Color.piccolo,
  },
  modalConfirmText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
