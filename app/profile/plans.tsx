import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl,
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
    Gap,
    LineHeight,
    Padding,
    StyleVariable,
} from "../../GlobalStyles";
import {
    createPlan,
    deletePlan,
    listPlans,
    updatePlan,
} from "../../services/plans";
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
  const supportsRelative =
    typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
  if (supportsRelative) {
    const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
    const diffDays = Math.round(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
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

const toTitleCase = (value?: string | null) => {
  if (!value) return "";
  const normalized = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!normalized) return "";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function PlansScreen() {
  const router = useRouter();
  const { fromAdmin } = useLocalSearchParams<{
    fromAdmin?: string | string[];
  }>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [createDuration, setCreateDuration] = useState("");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const loadData = useCallback(async () => {
    const [currentUser, availablePlans] = await Promise.all([
      getCurrentUser(),
      listPlans(),
    ]);
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
          setErrorMessage("Não foi possível carregar os planos disponiveis.");
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
      setErrorMessage("Não foi possível atualizar os planos.");
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

  const isAdminContext = useMemo(() => {
    if (
      fromAdmin === "1" ||
      (Array.isArray(fromAdmin) && fromAdmin.includes("1"))
    ) {
      return true;
    }
    return profile?.role === "CLUB_ADMIN";
  }, [fromAdmin, profile?.role]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const beginEdit = (plan: PlanResponse) => {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
    setEditDescription(plan.description ?? "");
    setEditPrice(plan.price.toString());
    setEditDuration(plan.durationMonths?.toString() ?? "");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const cancelEdit = () => {
    setEditingPlanId(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditDuration("");
  };

  const resetCreateForm = () => {
    setCreateName("");
    setCreateDescription("");
    setCreatePrice("");
    setCreateDuration("");
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCreateModalVisible(true);
  };

  const handleCloseCreate = () => {
    if (isCreatingPlan) {
      return;
    }
    setIsCreateModalVisible(false);
  };

  const handleSavePlan = async () => {
    if (!editingPlanId || isSavingPlan) return;

    const name = editName.trim();
    const description = editDescription.trim();
    const numericPrice = Number(
      editPrice.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    const numericDuration = Number(editDuration.replace(/\D/g, ""));

    if (!name) {
      setErrorMessage("Informe um nome para o plano.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Informe um valor válido para o plano.");
      return;
    }

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      setErrorMessage("Informe a duracao em meses.");
      return;
    }

    setIsSavingPlan(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const target = plans.find((p) => p.id === editingPlanId);
      if (!target) {
        setErrorMessage("Plano não encontrado para edição.");
        return;
      }

      const updated = await updatePlan(editingPlanId, {
        name,
        description,
        price: numericPrice,
        durationMonths: numericDuration,
      });

      setPlans((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
      );
      setSuccessMessage("Plano atualizado com sucesso.");
      cancelEdit();
    } catch (error) {
      console.error("Failed to update plan", error);
      setErrorMessage("Não foi possível atualizar o plano.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleCreatePlan = async () => {
    if (isCreatingPlan) return;

    const name = createName.trim();
    const description = createDescription.trim();
    const numericPrice = Number(
      createPrice.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    const numericDuration = Number(createDuration.replace(/\D/g, ""));

    if (!name) {
      setErrorMessage("Informe um nome para o plano.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Informe um valor válido para o plano.");
      return;
    }

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      setErrorMessage("Informe a duração em meses.");
      return;
    }

    setIsCreatingPlan(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await createPlan({
        name,
        description,
        price: numericPrice,
        durationMonths: numericDuration,
      });
      setPlans((prev) => [created, ...prev]);
      setSuccessMessage("Plano criado com sucesso.");
      setIsCreateModalVisible(false);
      resetCreateForm();
    } catch (error) {
      console.error("Failed to create plan", error);
      setErrorMessage("Não foi possível criar o plano.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleDeletePlan = (plan: PlanResponse) => {
    Alert.alert(
      "Excluir plano",
      `Deseja remover o plano ${toTitleCase(plan.name)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlan(plan.id);
              setPlans((prev) => prev.filter((item) => item.id !== plan.id));
              if (editingPlanId === plan.id) {
                cancelEdit();
              }
              setSuccessMessage("Plano removido com sucesso.");
            } catch (error) {
              console.error("Failed to delete plan", error);
              setErrorMessage("Não foi possível remover o plano.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
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
          {isAdminContext ? (
            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleOpenCreate}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Criar novo plano"
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={Color.piccolo}
              />
              <Text style={styles.headerActionText}>Novo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={Color.piccolo} />
            <Text style={styles.loaderLabel}>Carregando planos...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackError]}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={Color.supportiveChichi}
            />
            <Text style={styles.feedbackText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={[styles.feedbackBanner, styles.feedbackSuccess]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={Color.supportiveRoshi}
            />
            <Text style={styles.feedbackText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.currentPlanCard}>
          <Text style={styles.sectionTitle}>Plano ativo</Text>
          <Text style={styles.currentPlanName}>
            {toTitleCase(profile?.plan?.name) || "Nenhum plano selecionado"}
          </Text>
          <Text style={styles.currentPlanDescription}>
            {profile?.plan?.description ??
              "Escolha um plano para desbloquear benefícios exclusivos."}
          </Text>
          {currentPlanExpiration ? (
            <Text style={styles.currentPlanMeta}>
              Vencimento: {currentPlanExpiration}
            </Text>
          ) : null}
          <Text style={styles.currentPlanQuestion}>Renovar seu plano?</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() =>
              Linking.openURL(
                "https://wa.me/5511961995531?text=Ol%C3%A1%20Quinze,%20quero%20renovar%20meu%20plano",
              )
            }
          >
            <Text style={styles.secondaryButtonText}>Fazer Renovação</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Planos disponíveis</Text>
          {plans.length === 0 ? (
            <Text style={styles.emptyState}>
              Nenhum plano configurado ainda.
            </Text>
          ) : (
            plans.map((plan) => {
              const isActive = plan.id === currentPlanId;
              const isEditing = editingPlanId === plan.id;
              const showActiveHighlight = isActive && !isAdminContext;
              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    showActiveHighlight && styles.planCardActive,
                  ]}
                >
                  <View style={styles.planHeader}>
                    {isEditing ? (
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Nome do plano</Text>
                        <TextInput
                          style={styles.planInput}
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Ex: Quinze Standard"
                          placeholderTextColor={Color.mainTrunks}
                          editable={!isSavingPlan}
                        />
                      </View>
                    ) : (
                      <Text style={styles.planName}>
                        {toTitleCase(plan.name)}
                      </Text>
                    )}
                    {showActiveHighlight ? (
                      <View style={styles.planBadge}>
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={Color.mainGoten}
                        />
                        <Text style={styles.planBadgeText}>Ativo</Text>
                      </View>
                    ) : null}
                  </View>
                  {isEditing ? (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Descrição</Text>
                      <TextInput
                        style={[styles.planInput, styles.planDescriptionInput]}
                        value={editDescription}
                        onChangeText={setEditDescription}
                        placeholder="Explique o que o cliente recebe"
                        placeholderTextColor={Color.mainTrunks}
                        editable={!isSavingPlan}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  ) : (
                    <Text style={styles.planDescription}>
                      {plan.description}
                    </Text>
                  )}
                  {isAdminContext ? (
                    <>
                      <View style={styles.priceRow}>
                        {isEditing ? (
                          <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Valor</Text>
                            <TextInput
                              style={[styles.planInput, styles.priceInput]}
                              value={editPrice}
                              onChangeText={setEditPrice}
                              placeholder="Ex: 199,90"
                              placeholderTextColor={Color.mainTrunks}
                              keyboardType="decimal-pad"
                              editable={!isSavingPlan}
                            />
                          </View>
                        ) : (
                          <Text style={styles.planPrice}>
                            {formatCurrency(plan.price)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.priceRow}>
                        {isEditing ? (
                          <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Duração</Text>
                            <TextInput
                              style={[styles.planInput, styles.durationInput]}
                              value={editDuration}
                              onChangeText={setEditDuration}
                              placeholder="Ex: 1, 3, 6, 12"
                              placeholderTextColor={Color.mainTrunks}
                              keyboardType="number-pad"
                              editable={!isSavingPlan}
                            />
                          </View>
                        ) : (
                          <Text style={styles.planMeta}>
                            {`${plan.durationMonths ?? 0} meses`}
                          </Text>
                        )}
                      </View>
                    </>
                  ) : null}
                  {isAdminContext ? (
                    <View style={styles.planActions}>
                      {isEditing ? (
                        <>
                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={cancelEdit}
                            activeOpacity={0.85}
                            disabled={isSavingPlan}
                          >
                            <Text style={styles.secondaryButtonText}>
                              Cancelar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.primaryButton,
                              isSavingPlan && styles.primaryButtonDisabled,
                            ]}
                            onPress={handleSavePlan}
                            activeOpacity={0.85}
                            disabled={isSavingPlan}
                          >
                            {isSavingPlan ? (
                              <ActivityIndicator
                                size="small"
                                color={Color.mainGoten}
                              />
                            ) : (
                              <Text style={styles.primaryButtonText}>
                                Salvar
                              </Text>
                            )}
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={() => beginEdit(plan)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.secondaryButtonText}>Editar</Text>
                        </TouchableOpacity>
                      )}
                      {!isEditing ? (
                        <TouchableOpacity
                          style={styles.dangerButton}
                          onPress={() => handleDeletePlan(plan)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.dangerButtonText}>Excluir</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
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
            onPress={() =>
              Linking.openURL(
                "https://wa.me/5511961995531?text=Ol%C3%A1%20Quinze,%20quero%20falar%20sobre%20planos",
              )
            }
          >
            <Text style={styles.primaryButtonText}>Entrar em contato</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={styles.modalRoot}
        pointerEvents={isCreateModalVisible ? "auto" : "none"}
      >
        {isCreateModalVisible ? (
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: "padding", android: undefined })}
              keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
              style={styles.modalKeyboard}
            >
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalCard}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>Novo plano</Text>
                <View style={styles.modalFieldGroup}>
                  <Text style={styles.fieldLabel}>Nome do plano</Text>
                  <TextInput
                    style={[styles.planInput, styles.modalInput]}
                    value={createName}
                    onChangeText={setCreateName}
                    placeholder="Ex: Quinze Standard"
                    placeholderTextColor={Color.mainTrunks}
                    editable={!isCreatingPlan}
                  />
                </View>
                <View style={styles.modalFieldGroup}>
                  <Text style={styles.fieldLabel}>Descrição</Text>
                  <TextInput
                    style={[
                      styles.planInput,
                      styles.planDescriptionInput,
                      styles.modalInput,
                    ]}
                    value={createDescription}
                    onChangeText={setCreateDescription}
                    placeholder="Explique o que o cliente recebe"
                    placeholderTextColor={Color.mainTrunks}
                    editable={!isCreatingPlan}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.modalFieldGroup}>
                  <Text style={styles.fieldLabel}>Valor</Text>
                  <TextInput
                    style={[
                      styles.planInput,
                      styles.priceInput,
                      styles.modalInput,
                    ]}
                    value={createPrice}
                    onChangeText={setCreatePrice}
                    placeholder="Ex: 199,90"
                    placeholderTextColor={Color.mainTrunks}
                    keyboardType="decimal-pad"
                    editable={!isCreatingPlan}
                  />
                </View>
                <View style={styles.modalFieldGroup}>
                  <Text style={styles.fieldLabel}>Duração</Text>
                  <TextInput
                    style={[
                      styles.planInput,
                      styles.durationInput,
                      styles.modalInput,
                    ]}
                    value={createDuration}
                    onChangeText={setCreateDuration}
                    placeholder="Ex: 1, 3, 6, 12"
                    placeholderTextColor={Color.mainTrunks}
                    keyboardType="number-pad"
                    editable={!isCreatingPlan}
                  />
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCloseCreate}
                    activeOpacity={0.85}
                    disabled={isCreatingPlan}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      isCreatingPlan && styles.primaryButtonDisabled,
                    ]}
                    onPress={handleCreatePlan}
                    activeOpacity={0.85}
                    disabled={isCreatingPlan}
                  >
                    {isCreatingPlan ? (
                      <ActivityIndicator size="small" color={Color.mainGoten} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Criar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        ) : null}
      </View>
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
    paddingBottom: 120,
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
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
  },
  headerActionText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
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
  fieldGroup: {
    gap: Gap.gap_6,
    marginBottom: Gap.gap_12,
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
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
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: Gap.gap_8,
  },
  planInput: {
    flex: 1,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py3,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
    backgroundColor: Color.mainGohan,
  },
  planDescriptionInput: {
    minHeight: 64,
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
  priceRow: {
    marginTop: Gap.gap_8,
  },
  priceInput: {
    maxWidth: 200,
  },
  durationInput: {
    maxWidth: 160,
  },
  planPrice: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  planMeta: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Gap.gap_8,
    marginTop: Gap.gap_12,
  },
  dangerButton: {
    marginTop: Gap.gap_4,
    backgroundColor: "rgba(215, 38, 61, 0.1)",
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py3,
    paddingHorizontal: StyleVariable.px4,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.supportiveChichi,
  },
  priceRow: {
    marginTop: Gap.gap_8,
  },
  priceInput: {
    maxWidth: 200,
  },
  planPrice: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  planActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Gap.gap_8,
    marginTop: Gap.gap_12,
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
  primaryButtonDisabled: {
    opacity: 0.6,
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
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: Padding.padding_24,
    justifyContent: "center",
  },
  modalKeyboard: {
    width: "100%",
    maxHeight: "90%",
  },
  modalScroll: {
    width: "100%",
  },
  modalCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py6,
    gap: Gap.gap_24,
  },
  modalFieldGroup: {
    gap: Gap.gap_8,
    marginBottom: Gap.gap_12,
  },
  modalInput: {
    minHeight: 48,
  },
  modalTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Gap.gap_8,
  },
});
