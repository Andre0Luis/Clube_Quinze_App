import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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
import { logout as logoutService } from "../../services/auth";
import { getCurrentUser } from "../../services/users";
import type { UserProfileResponse } from "../../types/api";

type ProfileOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const profileOptions: ProfileOption[] = [
  {
    id: "personal-data",
    title: "Dados pessoais",
    description: "Atualize seus dados cadastrais.",
    icon: "id-card-outline",
    route: "/profile/personal-data",
  },
  {
    id: "preferences",
    title: "Preferencias",
    description: "Gerencie temas, comunicacoes e acessos.",
    icon: "options-outline",
    route: "/profile/preferences",
  },
  {
    id: "plans",
    title: "Planos",
    description: "Revise beneficios e historico do seu plano.",
    icon: "card-outline",
    route: "/profile/plans",
  },
  {
    id: "policies",
    title: "Termos e politicas",
    description: "Consulte nossos termos de uso e privacidade.",
    icon: "document-text-outline",
    route: "/profile/policies",
  },
];

const membershipLabels: Record<UserProfileResponse["membershipTier"], string> =
  {
    QUINZE_STANDARD: "Quinze Standard",
    QUINZE_PREMIUM: "Quinze Premium",
    QUINZE_SELECT: "Quinze Select",
  };

const roleLabels: Record<UserProfileResponse["role"], string> = {
  CLUB_STANDARD: "Membro Padrao",
  CLUB_SELECT: "Membro Select",
  CLUB_EMPLOYE: "Colaborador",
  CLUB_ADMIN: "Administrador",
};

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

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    const currentUser = await getCurrentUser();
    return currentUser;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
          const currentUser = await fetchProfile();
          if (!isActive) {
            return;
          }
          setProfile(currentUser);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          if (!isActive) {
            return;
          }
          setProfile(null);
          setErrorMessage("Nao foi possivel carregar seu perfil.");
        } finally {
          if (!isActive) {
            return;
          }
          setIsLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [fetchProfile]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const currentUser = await fetchProfile();
      setProfile(currentUser);
    } catch (error) {
      console.error("Failed to refresh profile", error);
      setErrorMessage("Nao foi possivel atualizar seu perfil.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProfile]);

  const displayName = useMemo(
    () => profile?.name ?? "Convidado",
    [profile?.name],
  );
  const membershipLabel = useMemo(
    () =>
      profile?.membershipTier
        ? (membershipLabels[profile.membershipTier] ?? profile.membershipTier)
        : null,
    [profile?.membershipTier],
  );
  const roleLabel = useMemo(
    () => (profile?.role ? (roleLabels[profile.role] ?? profile.role) : null),
    [profile?.role],
  );
  const lastLoginLabel = useMemo(
    () => formatDateLabel(profile?.lastLogin),
    [profile?.lastLogin],
  );
  const memberSinceLabel = useMemo(
    () => formatDateLabel(profile?.createdAt),
    [profile?.createdAt],
  );
  const avatarUri = useMemo(() => {
    if (profile?.profilePictureBase64) {
      return `data:image/jpeg;base64,${profile.profilePictureBase64}`;
    }
    return profile?.profilePictureUrl ?? null;
  }, [profile?.profilePictureBase64, profile?.profilePictureUrl]);

  const headerSubtitle = useMemo(() => {
    const defaultMessage =
      "Tenha uma experiencia personalizada e mantenha seus dados sempre atualizados.";
    if (!profile) {
      return defaultMessage;
    }
    const parts: string[] = [];
    if (membershipLabel) {
      parts.push(membershipLabel);
    }
    if (profile.plan?.name) {
      parts.push(profile.plan.name);
    }
    if (roleLabel) {
      parts.push(roleLabel);
    }
    return parts.length > 0 ? parts.join(" • ") : defaultMessage;
  }, [membershipLabel, profile, roleLabel]);

  const enhancedOptions = useMemo(() => {
    return profileOptions.map((option) => {
      if (option.id === "preferences") {
        const count = profile?.preferences?.length ?? 0;
        const label =
          count > 0
            ? `${count} preferencia${count > 1 ? "s" : ""} configurada${count > 1 ? "s" : ""}.`
            : "Defina preferencias de atendimento.";
        return { ...option, description: label };
      }
      if (option.id === "plans") {
        const label = profile?.plan
          ? profile.plan.name
          : "Conheca os planos disponiveis.";
        return { ...option, description: label };
      }
      return option;
    });
  }, [profile]);

  const handleOptionPress = useCallback(
    (option: ProfileOption) => {
      router.push(option.route);
    },
    [router],
  );

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await logoutService({ refreshToken });
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      setIsLoggingOut(false);
      setProfile(null);
      router.replace("/login");
    }
  }, [isLoggingOut, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Color.piccolo}
            colors={[Color.piccolo]}
          />
        }
      >
        <View style={styles.content}>
          {isLoading && !profile ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={Color.piccolo} />
              <Text style={styles.loaderLabel}>Carregando perfil...</Text>
            </View>
          ) : null}
          {errorMessage ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="warning-outline"
                size={18}
                color={Color.supportiveChichi}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          <View style={styles.headerCard}>
            <View style={styles.headerTexts}>
              <Text style={styles.headerGreeting}>Ola, {displayName}!</Text>
              <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
              <View style={styles.badgeRow}>
                {membershipLabel ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="star-outline"
                      size={14}
                      color={Color.mainGoten}
                    />
                    <Text style={styles.badgeText}>{membershipLabel}</Text>
                  </View>
                ) : null}
                {profile?.plan?.name ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="card-outline"
                      size={14}
                      color={Color.mainGoten}
                    />
                    <Text style={styles.badgeText}>{profile.plan.name}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.metaRow}>
                {memberSinceLabel ? (
                  <Text style={styles.metaText}>
                    Membro desde {memberSinceLabel}
                  </Text>
                ) : null}
                {lastLoginLabel ? (
                  <Text style={styles.metaText}>
                    Ultimo acesso {lastLoginLabel}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.headerIcon}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.headerAvatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={48}
                  color={Color.piccolo}
                />
              )}
            </View>
          </View>

          <View style={styles.optionList}>
            {enhancedOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                activeOpacity={0.85}
                onPress={() => handleOptionPress(option)}
              >
                <View style={styles.optionIconWrapper}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={Color.piccolo}
                  />
                </View>
                <View style={styles.optionTexts}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Color.mainTrunks}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={Color.mainGoten}
            />
            <Text style={styles.logoutText}>Sair do app</Text>
            {isLoggingOut ? (
              <ActivityIndicator
                size="small"
                color={Color.mainGoten}
                style={styles.logoutSpinner}
              />
            ) : null}
          </TouchableOpacity>

          <View style={styles.brandFooter}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.brandLogo}
              contentFit="contain"
            />
            <Text style={styles.brandTagline}>Far and beyond</Text>
          </View>
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
  scrollContent: {
    paddingBottom: Padding.padding_32,
  },
  content: {
    paddingTop: Padding.padding_32,
    paddingHorizontal: Padding.padding_24,
    gap: Gap.gap_24,
  },
  loader: {
    paddingVertical: Padding.padding_24,
    alignItems: "center",
    gap: Gap.gap_8,
  },
  loaderLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.supportiveChichi,
    backgroundColor: "rgba(255, 78, 100, 0.1)",
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.supportiveChichi,
  },
  headerCard: {
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGohan,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px6,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  headerTexts: {
    flex: 1,
    gap: Gap.gap_8,
  },
  headerGreeting: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  headerSubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Gap.gap_8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
  },
  badgeText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Gap.gap_8,
  },
  metaText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: Border.br_58,
  },
  optionList: {
    gap: Gap.gap_16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGohan,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  optionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  optionTitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  optionDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  highlightCard: {
    borderRadius: Border.br_16,
    backgroundColor: "rgba(0, 5, 61, 0.06)",
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_12,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
  },
  highlightBadge: {
    alignSelf: "flex-start",
    backgroundColor: Color.piccolo,
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px2,
  },
  highlightBadgeText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
    lineHeight: LineHeight.lh_16,
  },
  highlightTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  highlightDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  highlightMeta: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  highlightQuestion: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
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
  logoutButton: {
    marginTop: Gap.gap_8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Gap.gap_8,
    backgroundColor: Color.piccolo,
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
  },
  logoutText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  logoutSpinner: {
    marginLeft: Gap.gap_8,
  },
  brandFooter: {
    alignItems: "center",
    gap: Gap.gap_8,
    marginTop: Gap.gap_16,
  },
  brandLogo: {
    width: 80,
    height: 80,
  },
  brandTagline: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    letterSpacing: 1,
  },
});
