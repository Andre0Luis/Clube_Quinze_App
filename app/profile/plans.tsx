import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
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
} from "../../GlobalStyles";
import { listPlans } from "../../services/plans";
import { getCurrentUser, updateCurrentUser } from "../../services/users";
import type { PlanResponse, UserProfileResponse } from "../../types/api";

const formatCurrency = (value?: number) => {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }
  return `R$ ${value.toFixed(2)}`;
};

export default function PlansScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [currentUser, availablePlans] = await Promise.all([getCurrentUser(), listPlans()]);
    return { currentUser, availablePlans };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
          const { currentUser, availablePlans } = await loadData();
          if (!isActive) {
            return;
          }
          setProfile(currentUser);
          setPlans(availablePlans);
        } catch (error) {
          console.error("Failed to load plans", error);
          if (!isActive) {
            return;
          }
          setProfile(null);
          setPlans([]);
          setErrorMessage("Nao foi possivel carregar os planos disponiveis.");
        } finally {
          if (!isActive) {
            return;
          }
          setIsLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [loadData]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { currentUser, availablePlans } = await loadData();
      setProfile(currentUser);
      setPlans(availablePlans);
    } catch (error) {
      console.error("Failed to refresh plans", error);
      setErrorMessage("Nao foi possivel atualizar os planos.");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  const currentPlanId = profile?.plan?.id ?? null;

  const handleSelectPlan = useCallback(
    async (plan: PlanResponse) => {
      if (!profile) {
        return;
      }
      if (plan.id === currentPlanId) {
        setSuccessMessage("Este ja e o seu plano ativo.");
        return;
      }
      if (isUpdating) {
        return;
      }
      if (!profile.name || !profile.email) {
        setErrorMessage("Complete seus dados pessoais antes de atualizar o plano.");
        return;
      }

      setIsUpdating(true);
      setPendingPlanId(plan.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const updated = await updateCurrentUser({
          name: profile.name,
          email: profile.email,
          phone: profile.phone ?? undefined,
          birthDate: profile.birthDate ?? undefined,
          membershipTier: profile.membershipTier,
          planId: plan.id,
        });
        setProfile(updated);
        setSuccessMessage(`Plano ${plan.name} ativado com sucesso.`);
      } catch (error) {
        console.error("Failed to update plan", error);
        setErrorMessage("Nao foi possivel atualizar seu plano.");
      } finally {
        setIsUpdating(false);
        setPendingPlanId(null);
      }
    },
    [currentPlanId, isUpdating, profile],
  );

  const currentPlanPrice = useMemo(() => formatCurrency(profile?.plan?.price), [profile?.plan?.price]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Color.piccolo}
            colors={[Color.piccolo]}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={20} color={Color.hit} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planos</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={Color.piccolo} />
            <Text style={styles.loaderLabel}>Carregando planos...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackError]}>
            <Ionicons name="alert-circle-outline" size={18} color={Color.supportiveChichi} />
            <Text style={styles.feedbackText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackSuccess]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Color.supportiveRoshi} />
            <Text style={styles.feedbackText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.currentPlanCard}>
          <Text style={styles.sectionTitle}>Plano ativo</Text>
          <Text style={styles.currentPlanName}>{profile?.plan?.name ?? "Nenhum plano selecionado"}</Text>
          <Text style={styles.currentPlanDescription}>
            {profile?.plan?.description ?? "Escolha um plano para desbloquear beneficios exclusivos."}
          </Text>
          {currentPlanPrice ? (
            <Text style={styles.currentPlanPrice}>
              {currentPlanPrice} / {profile?.plan?.durationMonths ?? 12} meses
            </Text>
          ) : null}
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Planos disponiveis</Text>
          {plans.length === 0 ? (
            <Text style={styles.emptyState}>Nenhum plano configurado ainda.</Text>
          ) : (
            plans.map((plan) => {
              const isActive = plan.id === currentPlanId;
              const isPending = pendingPlanId === plan.id;
              const priceLabel = formatCurrency(plan.price);
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, isActive && styles.planCardActive]}
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isUpdating}
                  activeOpacity={0.85}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {isActive ? (
                      <View style={styles.planBadge}>
                        <Ionicons name="checkmark" size={14} color={Color.mainGoten} />
                        <Text style={styles.planBadgeText}>Ativo</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  {priceLabel ? (
                    <Text style={styles.planPrice}>{priceLabel} / {plan.durationMonths} meses</Text>
                  ) : null}
                  <View style={styles.planActions}>
                    <TouchableOpacity
                      style={[styles.planActionButton, isActive && styles.planActionButtonDisabled]}
                      onPress={() => handleSelectPlan(plan)}
                      disabled={isActive || isUpdating}
                      activeOpacity={0.85}
                    >
                      {isPending ? (
                        <ActivityIndicator size="small" color={Color.mainGoten} />
                      ) : (
                        <Text style={styles.planActionButtonText}>
                          {isActive ? "Plano atual" : "Ativar plano"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
  loader: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px6,
    alignItems: "center",
    gap: Gap.gap_8,
  },
  loaderLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    borderRadius: Border.br_16,
    borderWidth: 1,
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px4,
  },
  feedbackError: {
    borderColor: Color.supportiveChichi,
    backgroundColor: "rgba(255, 78, 100, 0.1)",
  },
  feedbackSuccess: {
    borderColor: Color.supportiveRoshi,
    backgroundColor: "rgba(46, 125, 50, 0.12)",
  },
  feedbackText: {
    flex: 1,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  sectionTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  currentPlanCard: {
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
  currentPlanName: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  currentPlanDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  currentPlanPrice: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  listCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
  },
  emptyState: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
  },
  planCardActive: {
    borderColor: Color.piccolo,
    backgroundColor: "rgba(0, 5, 61, 0.05)",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
  },
  planBadgeText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  planDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planPrice: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  planActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  planActionButton: {
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  planActionButtonDisabled: {
    backgroundColor: "rgba(0, 5, 61, 0.12)",
  },
  planActionButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
