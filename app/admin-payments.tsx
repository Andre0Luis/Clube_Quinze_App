import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    RefreshControl,
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
} from "../GlobalStyles";
import { listPaymentRenewals } from "../services/payments";
import { getUserById, renewUserPlan } from "../services/users";
import type { PaymentRenewalResponse } from "../types/api";

const formatCurrency = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "R$ 0,00";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

const formatRenewalDate = (value?: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const normalizePhone = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
};

export default function AdminPaymentsScreen() {
  const router = useRouter();
  const [renewals, setRenewals] = useState<PaymentRenewalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renewingUserId, setRenewingUserId] = useState<number | null>(null);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewTarget, setRenewTarget] = useState<PaymentRenewalResponse | null>(
    null,
  );
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const loadRenewals = useCallback(async () => {
    setErrorMessage(null);
    try {
      const data = await listPaymentRenewals();
      setRenewals(data);
    } catch (error) {
      console.error("Failed to load payment renewals", error);
      setErrorMessage("Não foi possível carregar os próximos pagamentos.");
      setRenewals([]);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      setIsLoading(true);
      await loadRenewals();
      if (isActive) {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      isActive = false;
    };
  }, [loadRenewals]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRenewals();
    setIsRefreshing(false);
  }, [loadRenewals]);

  const handleOpenPlans = useCallback(() => {
    router.push({ pathname: "/profile/plans", params: { fromAdmin: "1" } });
  }, [router]);

  const handleContactUser = useCallback(async (userId: number) => {
    try {
      const user = await getUserById(userId);
      const phone = normalizePhone(user?.phone ?? undefined);
      if (!phone) {
        Alert.alert(
          "Contato indisponível",
          "Este usuário não possui telefone cadastrado.",
        );
        return;
      }
      await Linking.openURL(`https://wa.me/${phone}`);
    } catch (error) {
      console.error("Failed to open WhatsApp", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir o WhatsApp para este usuário.",
      );
    }
  }, []);

  const handleOpenRenew = useCallback(
    (renewal: PaymentRenewalResponse) => {
      if (renewingUserId) {
        return;
      }
      const allowed = renewal.allowedDurations?.length
        ? renewal.allowedDurations
        : [1, 3, 6, 12];
      setRenewTarget(renewal);
      setSelectedDuration(allowed[0] ?? null);
      setRenewModalVisible(true);
    },
    [renewingUserId],
  );

  const handleConfirmRenew = useCallback(async () => {
    if (!renewTarget || !selectedDuration || renewingUserId) {
      return;
    }
    setRenewingUserId(renewTarget.userId);
    try {
      await renewUserPlan(renewTarget.userId, selectedDuration);
      await loadRenewals();
      setRenewModalVisible(false);
      setRenewTarget(null);
    } catch (error) {
      console.error("Failed to renew plan", error);
      Alert.alert("Erro", "Não foi possível renovar o plano deste usuário.");
    } finally {
      setRenewingUserId(null);
    }
  }, [loadRenewals, renewTarget, renewingUserId, selectedDuration]);

  const emptyMessage = useMemo(() => {
    if (isLoading) {
      return "";
    }
    if (errorMessage) {
      return errorMessage;
    }
    return "Nenhuma renovação nos próximos 60 dias.";
  }, [isLoading, errorMessage]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
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
        <Text style={styles.headerTitle}>Próximos pagamentos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.plansButton}
          onPress={handleOpenPlans}
          activeOpacity={0.88}
        >
          <Ionicons name="card-outline" size={18} color={Color.piccolo} />
          <Text style={styles.plansButtonText}>Ver planos</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={Color.piccolo} />
          </View>
        ) : null}

        {emptyMessage ? (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>{emptyMessage}</Text>
          </View>
        ) : null}

        {renewals.map((renewal) => (
          <View key={`renewal-${renewal.userId}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{renewal.userName}</Text>
              <Text style={styles.cardPrice}>
                {formatCurrency(renewal.plan?.price)}
              </Text>
            </View>
            <Text style={styles.cardPlan}>{renewal.plan?.name ?? "Plano"}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Vencimento</Text>
              <Text style={styles.metaValue}>
                {formatRenewalDate(renewal.planRenewalDate)}
              </Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContactUser(renewal.userId)}
                activeOpacity={0.85}
              >
                <Text style={styles.contactButtonText}>Entrar em contato</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.renewButton}
                onPress={() => handleOpenRenew(renewal)}
                activeOpacity={0.85}
                disabled={renewingUserId === renewal.userId}
              >
                {renewingUserId === renewal.userId ? (
                  <ActivityIndicator size="small" color={Color.mainGoten} />
                ) : (
                  <Text style={styles.renewButtonText}>Renovar plano</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={renewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenewModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setRenewModalVisible(false)}
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
              {(renewTarget?.allowedDurations?.length
                ? renewTarget.allowedDurations
                : [1, 3, 6, 12]
              ).map((duration) => {
                const active = selectedDuration === duration;
                const label = duration === 12 ? "1 ano" : `${duration} meses`;
                return (
                  <TouchableOpacity
                    key={`duration-${duration}`}
                    style={[
                      styles.optionButton,
                      active && styles.optionButtonActive,
                    ]}
                    onPress={() => setSelectedDuration(duration)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setRenewModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleConfirmRenew}
                activeOpacity={0.85}
                disabled={!selectedDuration || renewingUserId !== null}
              >
                {renewingUserId ? (
                  <ActivityIndicator size="small" color={Color.mainGoten} />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  loadingWrapper: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
    alignItems: "center",
  },
  feedbackBanner: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
  },
  feedbackText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  plansButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Gap.gap_8,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGoten,
    paddingVertical: StyleVariable.py2,
  },
  plansButtonText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  card: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_6,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.gap_8,
  },
  cardName: {
    flex: 1,
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_20,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  cardPrice: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  cardPlan: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  metaValue: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  actionRow: {
    marginTop: Gap.gap_8,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  contactButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.piccolo,
    backgroundColor: Color.mainGoten,
    paddingVertical: StyleVariable.py2,
  },
  contactButtonText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  renewButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    paddingVertical: StyleVariable.py2,
  },
  renewButtonText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
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
    gap: Gap.gap_12,
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
  },
  optionButton: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGoten,
  },
  optionButtonActive: {
    borderColor: Color.piccolo,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
  },
  optionLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  optionLabelActive: {
    color: Color.piccolo,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  modalCancel: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
  },
  modalCancelText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
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
