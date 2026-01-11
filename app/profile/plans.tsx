import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Linking,
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
import { getCurrentUser } from "../../services/users";
import type { PlanResponse, UserProfileResponse } from "../../types/api";

const formatDateLabel = (value?: string) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const supportsRelative = typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
  if (supportsRelative) {
    const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
    const diffDays = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (Math.abs(diffDays) < 7) {
      return formatter.format(diffDays, "day");
    }
  }
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const addMonths = (value: string, months: number) => {
  const base = new Date(value);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next;
};

export default function PlansScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const currentPlanExpiration = useMemo(() => {
    if (!profile?.plan?.durationMonths || !profile?.createdAt) {
      return null;
    }
    const computed = addMonths(profile.createdAt, profile.plan.durationMonths);
    if (!computed) {
      return null;
    }
    return formatDateLabel(computed.toISOString());
  }, [profile?.createdAt, profile?.plan?.durationMonths]);

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
          {currentPlanExpiration ? (
            <Text style={styles.currentPlanMeta}>Vencimento: {currentPlanExpiration}</Text>
          ) : null}
          <Text style={styles.currentPlanQuestion}>Deseja trocar de plano?</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL("https://wa.me/5511999999999?text=Ol%C3%A1%20Quinze,%20quero%20falar%20sobre%20planos")}
          >
            <Text style={styles.primaryButtonText}>Entrar em contato</Text>
          </TouchableOpacity>
          <Text style={styles.currentPlanQuestion}>Renovar seu plano?</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL("https://wa.me/5511999999999?text=Ol%C3%A1%20Quinze,%20quero%20renovar%20meu%20plano")}
          >
            <Text style={styles.secondaryButtonText}>Fazer Renovacao</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Planos disponiveis</Text>
          {plans.length === 0 ? (
            <Text style={styles.emptyState}>Nenhum plano configurado ainda.</Text>
          ) : (
            plans.map((plan) => {
              const isActive = plan.id === currentPlanId;
              return (
                <View key={plan.id} style={[styles.planCard, isActive && styles.planCardActive]}>
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
                </View>
              );
            })
          )}
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.sectionTitle}>Deseja trocar de plano?</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL("https://wa.me/5511999999999?text=Ol%C3%A1%20Quinze,%20quero%20falar%20sobre%20planos")}
          >
            <Text style={styles.primaryButtonText}>Entrar em contato</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Renovar seu plano?</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL("https://wa.me/5511999999999?text=Ol%C3%A1%20Quinze,%20quero%20renovar%20meu%20plano")}
          >
            <Text style={styles.secondaryButtonText}>Fazer Renovacao</Text>
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
	currentPlanMeta: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.hit,
	},
	currentPlanQuestion: {
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
		paddingVertical: StyleVariable.py3,
		gap: Gap.gap_12,
	},
	planCardActive: {
		borderColor: Color.piccolo,
		backgroundColor: "rgba(71, 82, 214, 0.05)",
	},
	planHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.gap_8,
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
	ctaCard: {
		borderRadius: Border.br_16,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
		backgroundColor: Color.mainGohan,
		paddingHorizontal: StyleVariable.px6,
		paddingVertical: StyleVariable.py4,
		gap: Gap.gap_12,
	},
	primaryButton: {
		marginTop: Gap.gap_4,
		backgroundColor: Color.piccolo,
		borderRadius: Border.br_16,
		paddingVertical: StyleVariable.py3,
		paddingHorizontal: StyleVariable.px4,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryButtonText: {
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainGoten,
	},
	secondaryButton: {
		marginTop: Gap.gap_4,
		backgroundColor: Color.mainGoten,
		borderRadius: Border.br_16,
		paddingVertical: StyleVariable.py3,
		paddingHorizontal: StyleVariable.px4,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
	},
	secondaryButtonText: {
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansBold,
		color: Color.piccolo,
	},
});
