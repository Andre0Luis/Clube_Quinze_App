import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ListRenderItemInfo,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
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
    StyleVariable
} from "../../GlobalStyles";
import {
    deletePreference,
    listPreferences,
    updatePreference,
    upsertPreference,
} from "../../services/preferences";
import type { PreferenceResponse } from "../../types/api";

const SEARCH_TERM_STORAGE_KEY = "@preferences/searchTerm";

const escapeRegExp = (value: string) => value.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");

const formatDateLabel = (value?: string) => {
  if (!value) {
    return "Agora";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const supportsRelative = typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
  if (supportsRelative) {
    const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
    if (Math.abs(diffMinutes) < 60) {
      return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(diffMinutes, "minute");
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(diffHours, "hour");
    }
    const diffDays = Math.round(diffHours / 24);
    return new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(diffDays, "day");
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<PreferenceResponse | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const restoreSearchTerm = async () => {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_TERM_STORAGE_KEY);
        if (stored && isMounted) {
          setSearchTerm(stored);
        }
      } catch (error) {
        console.error("Failed to restore search term", error);
      }
    };

    restoreSearchTerm();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      AsyncStorage.setItem(SEARCH_TERM_STORAGE_KEY, searchTerm).catch((error) => {
        console.error("Failed to persist search term", error);
      });
    }, 350);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const loadPreferences = useCallback(async () => {
    const data = await listPreferences();
    return data;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
          const data = await loadPreferences();
          if (!isActive) {
            return;
          }
          setPreferences(data);
        } catch (error) {
          console.error("Failed to load preferences", error);
          if (!isActive) {
            return;
          }
          setPreferences([]);
          setErrorMessage("Nao foi possivel carregar suas preferencias.");
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
    }, [loadPreferences]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await loadPreferences();
      setPreferences(data);
    } catch (error) {
      console.error("Failed to refresh preferences", error);
      setErrorMessage("Nao foi possivel atualizar as preferencias.");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPreferences]);

  const handleSelectPreference = useCallback((preference: PreferenceResponse) => {
    setSelectedPreference(preference);
    setKeyInput(preference.key);
    setValueInput(preference.value);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleResetSelection = useCallback(() => {
    setSelectedPreference(null);
    setKeyInput("");
    setValueInput("");
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const trimmedKey = keyInput.trim();
    const trimmedValue = valueInput.trim();

    if (!trimmedKey || !trimmedValue) {
      setErrorMessage("Informe chave e valor para a preferencia.");
      return;
    }

    const duplicate = preferences.find(
      (item) =>
        item.id !== selectedPreference?.id && item.key.trim().toLowerCase() === trimmedKey.toLowerCase(),
    );
    if (duplicate) {
      setErrorMessage("Ja existe uma preferencia com essa chave. Atualize a existente ou escolha outro nome.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (selectedPreference) {
        const updated = await updatePreference(selectedPreference.id, {
          key: trimmedKey,
          value: trimmedValue,
        });
        setPreferences((prev) =>
          prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
        );
        setSelectedPreference(updated);
        setSuccessMessage("Preferencia atualizada com sucesso.");
      } else {
        const created = await upsertPreference({ key: trimmedKey, value: trimmedValue });
        setPreferences((prev) => [created, ...prev]);
        setSelectedPreference(created);
        setSuccessMessage("Preferencia adicionada com sucesso.");
      }
      setKeyInput(trimmedKey);
      setValueInput(trimmedValue);
    } catch (error) {
      console.error("Failed to persist preference", error);
      setErrorMessage("Nao foi possivel salvar esta preferencia.");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, keyInput, selectedPreference, valueInput]);

  const handleDelete = useCallback(async () => {
    if (!selectedPreference || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deletePreference(selectedPreference.id);
      setPreferences((prev) => prev.filter((item) => item.id !== selectedPreference.id));
      setSelectedPreference(null);
      setKeyInput("");
      setValueInput("");
      setSuccessMessage("Preferencia removida com sucesso.");
    } catch (error) {
      console.error("Failed to delete preference", error);
      setErrorMessage("Nao foi possivel remover esta preferencia.");
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, selectedPreference]);

  const sortedPreferences = useMemo(() => {
    return [...preferences].sort((a, b) => a.key.localeCompare(b.key));
  }, [preferences]);

  const filteredPreferences = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return sortedPreferences;
    }
    return sortedPreferences.filter((item) => {
      return item.key.toLowerCase().includes(term) || item.value.toLowerCase().includes(term);
    });
  }, [searchTerm, sortedPreferences]);

  const renderHighlightedText = useCallback(
    (text: string, style: TextStyle) => {
      const term = searchTerm.trim();
      if (!term) {
        return <Text style={style}>{text}</Text>;
      }

      const termLower = term.toLowerCase();
      const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
      const parts = text.split(regex);

      return (
        <Text style={style}>
          {parts.map((part, index) => {
            if (part.toLowerCase() === termLower) {
              return (
                <Text key={`${part}-${index}`} style={styles.preferenceHighlight}>
                  {part}
                </Text>
              );
            }
            return <Text key={`${part}-${index}`}>{part}</Text>;
          })}
        </Text>
      );
    },
    [searchTerm],
  );

  const renderPreferenceItem = useCallback(
    ({ item }: ListRenderItemInfo<PreferenceResponse>) => {
      const isActive = selectedPreference?.id === item.id;
      return (
        <TouchableOpacity
          style={[styles.preferenceRow, isActive && styles.preferenceRowActive]}
          onPress={() => handleSelectPreference(item)}
          activeOpacity={0.85}
        >
          <View style={styles.preferenceIcon}>
            <Ionicons
              name={isActive ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isActive ? Color.piccolo : Color.mainTrunks}
            />
          </View>
          <View style={styles.preferenceTexts}>
            {renderHighlightedText(item.key, styles.preferenceKey)}
            {renderHighlightedText(item.value, styles.preferenceValue)}
            <Text style={styles.preferenceMeta}>Atualizado {formatDateLabel(item.updatedAt)}</Text>
          </View>
          <Ionicons name="create-outline" size={18} color={Color.mainTrunks} />
        </TouchableOpacity>
      );
    },
    [handleSelectPreference, renderHighlightedText, selectedPreference?.id],
  );

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
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.headerTitle}>Preferencias</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={Color.piccolo} />
            <Text style={styles.loaderLabel}>Carregando preferencias...</Text>
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

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <View style={styles.listHeaderTexts}>
              <Text style={styles.sectionTitle}>Preferencias salvas</Text>
              <Text style={styles.listMeta}>{`${filteredPreferences.length}/${sortedPreferences.length} itens`}</Text>
            </View>
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={16} color={Color.mainTrunks} />
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={handleSearchChange}
                placeholder="Filtrar por chave ou valor"
                placeholderTextColor={Color.mainTrunks}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchTerm ? (
                <TouchableOpacity
                  onPress={() => handleSearchChange("")}
                  style={styles.searchClear}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar filtro"
                >
                  <Ionicons name="close-circle" size={16} color={Color.mainTrunks} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          {sortedPreferences.length === 0 ? (
            <Text style={styles.emptyState}>Nenhuma preferencia cadastrada ainda.</Text>
          ) : (
            <FlatList
              data={filteredPreferences}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPreferenceItem}
              ItemSeparatorComponent={() => <View style={styles.preferenceSeparator} />}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyState}>Nenhum resultado para o filtro aplicado.</Text>}
            />
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {selectedPreference ? "Editar preferencia" : "Nova preferencia"}
          </Text>
          {selectedPreference ? (
            <TouchableOpacity
              style={styles.resetSelectionButton}
              onPress={handleResetSelection}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={16} color={Color.piccolo} />
              <Text style={styles.resetSelectionText}>Adicionar nova preferencia</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Chave</Text>
            <TextInput
              style={styles.fieldInput}
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder="Ex.: bebida, musica, profissional"
              placeholderTextColor={Color.mainTrunks}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Valor</Text>
            <TextInput
              style={styles.fieldInput}
              value={valueInput}
              onChangeText={setValueInput}
              placeholder="Defina o valor da preferencia"
              placeholderTextColor={Color.mainTrunks}
            />
          </View>

          <View style={styles.formActions}>
            {selectedPreference ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleResetSelection}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Color.mainGoten} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {selectedPreference ? "Atualizar" : "Adicionar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {selectedPreference ? (
            <TouchableOpacity
              style={[styles.dangerButton, isDeleting && styles.dangerButtonDisabled]}
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={Color.mainGoten} />
              ) : (
                <Text style={styles.dangerButtonText}>Remover preferencia</Text>
              )}
            </TouchableOpacity>
          ) : null}
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
  listCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_16,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
  },
  listHeaderTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  listMeta: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    gap: Gap.gap_8,
  },
  searchInput: {
    minWidth: 140,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
    flex: 1,
  },
  searchClear: {
    padding: StyleVariable.px1,
  },
  emptyState: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  preferenceSeparator: {
    height: Gap.gap_12,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  preferenceRowActive: {
    borderColor: Color.piccolo,
    backgroundColor: "rgba(0, 5, 61, 0.05)",
  },
  preferenceIcon: {
    width: 36,
    height: 36,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  preferenceTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  preferenceKey: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  preferenceValue: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  preferenceMeta: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    opacity: 0.8,
  },
  preferenceHighlight: {
    color: Color.piccolo,
  },
  formCard: {
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
  fieldGroup: {
    gap: Gap.gap_8,
  },
  resetSelectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  resetSelectionText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  fieldLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  fieldInput: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Gap.gap_8,
  },
  primaryButton: {
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  secondaryButton: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.16)",
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
  },
  secondaryButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  dangerButton: {
    borderRadius: Border.br_16,
    backgroundColor: Color.supportiveChichi,
    paddingVertical: StyleVariable.py2,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonDisabled: {
    opacity: 0.6,
  },
  dangerButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
