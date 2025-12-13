import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { MaskedTextInput, Masks } from "react-native-mask-input";
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
import type { MembershipTier, PlanResponse, UserProfileResponse } from "../../types/api";

const membershipOptions: Array<{
  id: MembershipTier;
  title: string;
  description: string;
}> = [
  {
    id: "CLUB_15",
    title: "Clube Quinze",
    description: "Experiencia essencial com todos os servicos do clube.",
  },
  {
    id: "QUINZE_SELECT",
    title: "Quinze Select",
    description: "Agenda preferencial e vantagens exclusivas para membros Select.",
  },
];

const MAX_GALLERY_ITEMS = 4;

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const formatPhoneInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const digits = sanitizeDigits(value);
  if (!digits) {
    return "";
  }
  const localDigits = digits.length > 11 ? digits.slice(digits.length - 11) : digits;
  if (localDigits.length <= 10) {
    const area = localDigits.slice(0, 2);
    const prefix = localDigits.slice(2, 6);
    const suffix = localDigits.slice(6);
    if (!area || !prefix) {
      return value;
    }
    return `(${area}) ${prefix}${suffix ? `-${suffix}` : ""}`.trim();
  }
  const area = localDigits.slice(0, 2);
  const prefix = localDigits.slice(2, 7);
  const suffix = localDigits.slice(7);
  if (!area || !prefix) {
    return value;
  }
  return `(${area}) ${prefix}${suffix ? `-${suffix}` : ""}`.trim();
};

const sanitizePhonePayload = (value: string): string | undefined => {
  const digits = sanitizeDigits(value);
  return digits.length ? digits : undefined;
};

type ProfileMedia = {
  id: string;
  uri: string;
  base64?: string;
  remoteUrl?: string;
};

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  membershipTier: MembershipTier;
  planId?: number;
};

const formatCurrency = (value?: number) => {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }
  return `R$ ${value.toFixed(2)}`;
};

export default function PersonalDataScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    membershipTier: "CLUB_15",
    planId: undefined,
  });
  const [avatar, setAvatar] = useState<ProfileMedia | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<ProfileMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [isPickingGallery, setIsPickingGallery] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [planErrorMessage, setPlanErrorMessage] = useState<string | null>(null);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);

  const loadProfile = useCallback(async () => {
    const currentUser = await getCurrentUser();
    return currentUser;
  }, []);

  const loadPlans = useCallback(async () => {
    const availablePlans = await listPlans();
    return availablePlans;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        setIsLoadingPlans(true);
        setPlanErrorMessage(null);
        const [userResult, plansResult] = await Promise.allSettled([loadProfile(), loadPlans()]);
        if (!isActive) {
          return;
        }

        if (userResult.status === "fulfilled") {
          const currentUser = userResult.value;
          setProfile(currentUser);
          setForm({
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
            phone: formatPhoneInput(currentUser.phone),
            birthDate: currentUser.birthDate ?? "",
            membershipTier: currentUser.membershipTier,
            planId: currentUser.plan?.id,
          });
          const avatarMedia = currentUser.profilePictureBase64
            ? {
                id: "avatar-loaded",
                uri: `data:image/jpeg;base64,${currentUser.profilePictureBase64}`,
                base64: currentUser.profilePictureBase64,
              }
            : currentUser.profilePictureUrl
              ? {
                  id: "avatar-loaded",
                  uri: currentUser.profilePictureUrl,
                  remoteUrl: currentUser.profilePictureUrl,
                }
              : null;
          setAvatar(avatarMedia);
          const galleryItems = (currentUser.gallery ?? [])
            .filter((item) => item.imageUrl || item.imageBase64)
            .sort((first, second) => first.position - second.position)
            .map<ProfileMedia>((item, index) => ({
              id: `gallery-${item.position}-${index}`,
              uri: item.imageBase64
                ? `data:image/jpeg;base64,${item.imageBase64}`
                : item.imageUrl ?? `gallery-${item.position}`,
              base64: item.imageBase64 ?? undefined,
              remoteUrl: item.imageUrl ?? undefined,
            }))
            .filter((item) => Boolean(item.uri));
          setGalleryMedia(galleryItems);
        } else {
          console.error("Failed to load personal data", userResult.reason);
          setProfile(null);
          setErrorMessage("Nao foi possivel carregar seus dados.");
        }

        if (plansResult.status === "fulfilled") {
          setPlans(plansResult.value);
        } else {
          console.error("Failed to load plans", plansResult.reason);
          setPlans([]);
          setPlanErrorMessage("Nao foi possivel carregar os planos disponiveis.");
        }

        setIsLoading(false);
        setIsLoadingPlans(false);
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [loadPlans, loadProfile]),
  );

  const activePlan = useMemo<PlanResponse | null>(() => {
    if (form.planId != null) {
      const selected = plans.find((item) => item.id === form.planId);
      if (selected) {
        return selected;
      }
    }
    return profile?.plan ?? null;
  }, [form.planId, plans, profile?.plan]);

  const hasPendingPlanChange = useMemo(() => {
    if (form.planId == null) {
      return false;
    }
    return form.planId !== profile?.plan?.id;
  }, [form.planId, profile?.plan?.id]);

  const currentPlanPrice = useMemo(() => formatCurrency(activePlan?.price), [activePlan?.price]);
  const galleryCountLabel = useMemo(() => `${galleryMedia.length}/${MAX_GALLERY_ITEMS}`, [galleryMedia.length]);
  const isGalleryFull = galleryMedia.length >= MAX_GALLERY_ITEMS;

  const handleFieldChange = useCallback(<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectAvatar = useCallback(async () => {
    if (isPickingAvatar) {
      return;
    }

    setIsPickingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso a galeria para atualizar sua foto de perfil.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      setAvatar({
        id: `avatar-${Date.now()}`,
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
      });
    } catch (error) {
      console.error("Failed to pick avatar media", error);
      setErrorMessage("Nao foi possivel acessar sua galeria agora.");
    } finally {
      setIsPickingAvatar(false);
    }
  }, [isPickingAvatar]);

  const handleCaptureAvatar = useCallback(async () => {
    if (isPickingAvatar) {
      return;
    }

    setIsPickingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso a camera para atualizar sua foto de perfil.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      setAvatar({
        id: `avatar-${Date.now()}`,
        uri: asset.uri,
        base64: asset.base64 ?? undefined,
      });
    } catch (error) {
      console.error("Failed to capture avatar media", error);
      setErrorMessage("Nao foi possivel acessar a camera agora.");
    } finally {
      setIsPickingAvatar(false);
    }
  }, [isPickingAvatar]);

  const handleClearAvatar = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAvatar(null);
  }, []);

  const handleAddGalleryMedia = useCallback(async () => {
    if (isPickingGallery) {
      return;
    }

    if (galleryMedia.length >= MAX_GALLERY_ITEMS) {
      return;
    }

    setIsPickingGallery(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso a galeria para anexar imagens.");
        return;
      }

      const remainingSlots = Math.max(0, MAX_GALLERY_ITEMS - galleryMedia.length) || 1;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const assets = result.assets ?? [];
      if (!assets.length) {
        return;
      }

      setGalleryMedia((prev) => {
        const mapped = assets.map((asset, index) => ({
          id: `gallery-${Date.now()}-${index}`,
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
        }));
        const merged = [...prev, ...mapped];
        return merged.slice(0, MAX_GALLERY_ITEMS);
      });
    } catch (error) {
      console.error("Failed to pick gallery media", error);
      setErrorMessage("Nao foi possivel acessar sua galeria agora.");
    } finally {
      setIsPickingGallery(false);
    }
  }, [galleryMedia.length, isPickingGallery]);

  const handleCaptureGalleryMedia = useCallback(async () => {
    if (isPickingGallery) {
      return;
    }

    if (galleryMedia.length >= MAX_GALLERY_ITEMS) {
      return;
    }

    setIsPickingGallery(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso a camera para anexar imagens.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      setGalleryMedia((prev) => {
        if (prev.length >= MAX_GALLERY_ITEMS) {
          return prev;
        }
        const next = [
          ...prev,
          {
            id: `gallery-${Date.now()}`,
            uri: asset.uri,
            base64: asset.base64 ?? undefined,
          },
        ];
        return next.slice(0, MAX_GALLERY_ITEMS);
      });
    } catch (error) {
      console.error("Failed to capture gallery media", error);
      setErrorMessage("Nao foi possivel acessar a camera agora.");
    } finally {
      setIsPickingGallery(false);
    }
  }, [galleryMedia.length, isPickingGallery]);

  const handleRemoveGalleryItem = useCallback((id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGalleryMedia((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleMoveGalleryItem = useCallback((id: string, direction: "up" | "down") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGalleryMedia((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) {
        return prev;
      }
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenPlanModal = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsPlanModalVisible(true);
  }, []);

  const handleClosePlanModal = useCallback(() => {
    setIsPlanModalVisible(false);
  }, []);

  const handleSelectPlanOption = useCallback((plan: PlanResponse) => {
    setForm((prev) => ({ ...prev, planId: plan.id }));
    setIsPlanModalVisible(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const handleClearPlanSelection = useCallback(() => {
    setForm((prev) => ({ ...prev, planId: undefined }));
    setIsPlanModalVisible(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSaving) {
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Informe seu nome completo.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Informe um email valido.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const avatarBase64 = avatar?.base64 ?? null;
      const avatarUrlCandidate = avatar?.remoteUrl ?? (avatar?.uri && avatar.uri.startsWith("http") ? avatar.uri : undefined);
      const galleryPayload = galleryMedia.map((item, index) => ({
        position: index + 1,
        imageBase64: item.base64 ?? null,
        imageUrl: item.base64
          ? null
          : item.remoteUrl ?? (item.uri && item.uri.startsWith("http") ? item.uri : null),
      }));
      const sanitizedPhone = sanitizePhonePayload(form.phone ?? "");
      const normalizedBirthDate = form.birthDate.trim() ? form.birthDate.trim() : undefined;

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: sanitizedPhone,
        birthDate: normalizedBirthDate,
        membershipTier: form.membershipTier,
        planId: form.planId ?? profile?.plan?.id,
        profilePictureBase64: avatar
          ? avatarBase64
          : null,
        profilePictureUrl: avatar
          ? avatarBase64
            ? null
            : avatarUrlCandidate ?? null
          : null,
        gallery: galleryPayload,
      };

      const updated = await updateCurrentUser(payload);
      setProfile(updated);
      setForm({
        name: updated.name ?? payload.name,
        email: updated.email ?? payload.email,
        phone: formatPhoneInput(updated.phone),
        birthDate: updated.birthDate ?? "",
        membershipTier: updated.membershipTier,
        planId: updated.plan?.id,
      });
      const updatedAvatar = updated.profilePictureBase64
        ? {
            id: `avatar-${Date.now()}`,
            uri: `data:image/jpeg;base64,${updated.profilePictureBase64}`,
            base64: updated.profilePictureBase64,
          }
        : updated.profilePictureUrl
          ? {
              id: `avatar-${Date.now()}`,
              uri: updated.profilePictureUrl,
              remoteUrl: updated.profilePictureUrl,
            }
          : null;
      setAvatar(updatedAvatar);
      const updatedGallery = (updated.gallery ?? [])
        .filter((item) => item.imageUrl || item.imageBase64)
        .sort((first, second) => first.position - second.position)
        .map<ProfileMedia>((item, index) => ({
          id: `gallery-${item.position}-${index}`,
          uri: item.imageBase64
            ? `data:image/jpeg;base64,${item.imageBase64}`
            : item.imageUrl ?? `gallery-${item.position}`,
          base64: item.imageBase64 ?? undefined,
          remoteUrl: item.imageUrl ?? undefined,
        }));
      setGalleryMedia(updatedGallery);
      setSuccessMessage("Dados atualizados com sucesso.");
    } catch (error) {
      console.error("Failed to update personal data", error);
      setErrorMessage("Nao foi possivel salvar suas alteracoes.");
    } finally {
      setIsSaving(false);
    }
  }, [avatar, form, galleryMedia, isSaving, profile?.plan?.id]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="arrow-back" size={20} color={Color.hit} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados pessoais</Text>
            <View style={styles.headerSpacer} />
          </View>

          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={Color.piccolo} />
              <Text style={styles.loaderLabel}>Carregando informações...</Text>
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

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Imagem e galeria</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarPreview}>
                {avatar ? (
                  <Image source={{ uri: avatar.uri }} style={styles.avatarPreviewImage} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={28} color={Color.mainTrunks} />
                )}
              </View>
              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={[styles.avatarPrimaryButton, isPickingAvatar && styles.avatarPrimaryButtonDisabled]}
                  onPress={handleSelectAvatar}
                  activeOpacity={0.85}
                  disabled={isPickingAvatar}
                >
                  {isPickingAvatar ? (
                    <ActivityIndicator size="small" color={Color.mainGoten} />
                  ) : (
                    <Text style={styles.avatarPrimaryButtonText}>Atualizar foto</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.avatarSecondaryButton, isPickingAvatar && styles.avatarSecondaryButtonDisabled]}
                  onPress={handleCaptureAvatar}
                  activeOpacity={0.85}
                  disabled={isPickingAvatar}
                >
                  <Ionicons name="camera-outline" size={14} color={Color.piccolo} />
                  <Text style={styles.avatarSecondaryButtonText}>Usar camera</Text>
                </TouchableOpacity>
                {avatar ? (
                  <TouchableOpacity
                    style={styles.avatarRemoveButton}
                    onPress={handleClearAvatar}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.avatarRemoveText}>Remover foto</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View style={styles.gallerySectionHeader}>
              <Text style={styles.fieldLabel}>Galeria ({galleryCountLabel})</Text>
              <View style={styles.galleryActions}>
                <TouchableOpacity
                  style={[styles.galleryActionButton, (isPickingGallery || isGalleryFull) && styles.galleryActionButtonDisabled]}
                  onPress={handleCaptureGalleryMedia}
                  activeOpacity={0.85}
                  disabled={isPickingGallery || isGalleryFull}
                >
                  {isPickingGallery ? (
                    <ActivityIndicator size="small" color={Color.piccolo} />
                  ) : (
                    <View style={styles.galleryActionButtonContent}>
                      <Ionicons name="camera-outline" size={16} color={Color.piccolo} />
                      <Text style={styles.galleryActionButtonLabel}>
                        {isGalleryFull ? "Limite atingido" : "Capturar"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.galleryActionButton, (isPickingGallery || isGalleryFull) && styles.galleryActionButtonDisabled]}
                  onPress={handleAddGalleryMedia}
                  activeOpacity={0.85}
                  disabled={isPickingGallery || isGalleryFull}
                >
                  {isPickingGallery ? (
                    <ActivityIndicator size="small" color={Color.piccolo} />
                  ) : (
                    <View style={styles.galleryActionButtonContent}>
                      <Ionicons name="images-outline" size={16} color={Color.piccolo} />
                      <Text style={styles.galleryActionButtonLabel}>
                        {isGalleryFull ? "Limite atingido" : "Adicionar"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {galleryMedia.length === 0 ? (
              <Text style={styles.galleryEmptyHint}>
                Selecione ate {MAX_GALLERY_ITEMS} imagens para mostrar seu estilo no app.
              </Text>
            ) : (
              <View style={styles.galleryThumbGrid}>
                {galleryMedia.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === galleryMedia.length - 1;
                  return (
                    <View key={item.id} style={styles.galleryThumbWrapper}>
                      <Image source={{ uri: item.uri }} style={styles.galleryThumbImage} contentFit="cover" />
                      <View style={styles.galleryOrderBadge}>
                        <Text style={styles.galleryOrderText}>{index + 1}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.galleryRemoveButton}
                        onPress={() => handleRemoveGalleryItem(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Remover imagem da galeria"
                        activeOpacity={0.85}
                      >
                        <Ionicons name="close" size={12} color={Color.mainGoten} />
                      </TouchableOpacity>
                      <View style={styles.galleryThumbControls}>
                        <TouchableOpacity
                          style={[styles.galleryControlButton, isFirst && styles.galleryControlButtonDisabled]}
                          onPress={() => handleMoveGalleryItem(item.id, "up")}
                          disabled={isFirst}
                          accessibilityLabel="Mover imagem para cima"
                        >
                          <Ionicons name="chevron-up" size={14} color={Color.mainGoten} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.galleryControlButton, isLast && styles.galleryControlButtonDisabled]}
                          onPress={() => handleMoveGalleryItem(item.id, "down")}
                          disabled={isLast}
                          accessibilityLabel="Mover imagem para baixo"
                        >
                          <Ionicons name="chevron-down" size={14} color={Color.mainGoten} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informacoes basicas</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nome completo</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.name}
                onChangeText={(value) => handleFieldChange("name", value)}
                placeholder="Digite como prefere ser chamado"
                placeholderTextColor={Color.mainTrunks}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.email}
                onChangeText={(value) => handleFieldChange("email", value)}
                placeholder="nome@email.com"
                placeholderTextColor={Color.mainTrunks}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Telefone</Text>
              <MaskedTextInput
                style={styles.fieldInput}
                value={form.phone}
                onChangeText={(masked) => handleFieldChange("phone", masked)}
                mask={Masks.BRL_PHONE}
                placeholder="(11) 99999-0000"
                placeholderTextColor={Color.mainTrunks}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Data de nascimento</Text>
              <MaskedTextInput
                style={styles.fieldInput}
                value={form.birthDate}
                onChangeText={(masked) => handleFieldChange("birthDate", masked)}
                mask={Masks.DATE_YYYYMMDD}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Color.mainTrunks}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Tipo de assinatura</Text>
            <View style={styles.membershipOptions}>
              {membershipOptions.map((option) => {
                const isActive = form.membershipTier === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.membershipCard, isActive && styles.membershipCardActive]}
                    onPress={() => handleFieldChange("membershipTier", option.id)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.membershipHeader}>
                      <Ionicons
                        name={isActive ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={isActive ? Color.piccolo : Color.mainTrunks}
                      />
                      <Text style={styles.membershipTitle}>{option.title}</Text>
                    </View>
                    <Text style={styles.membershipDescription}>{option.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.planHeader}>
              <Text style={styles.sectionTitle}>Plano atual</Text>
              <View style={styles.planActions}>
                {isLoadingPlans ? <ActivityIndicator size="small" color={Color.piccolo} /> : null}
                <TouchableOpacity
                  style={[styles.planManageButton, isLoadingPlans && styles.planManageButtonDisabled]}
                  onPress={handleOpenPlanModal}
                  activeOpacity={0.85}
                  disabled={isLoadingPlans}
                >
                  <Text style={styles.planManageText}>Selecionar plano</Text>
                  <Ionicons name="swap-horizontal" size={16} color={Color.piccolo} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.planName}>{activePlan?.name ?? "Nenhum plano selecionado"}</Text>
            <Text style={styles.planDescription}>
              {activePlan?.description ?? "Escolha um plano para aproveitar beneficios exclusivos."}
            </Text>
            {currentPlanPrice ? (
              <Text style={styles.planPrice}>{currentPlanPrice} por {activePlan?.durationMonths ?? 12} meses</Text>
            ) : null}
            {hasPendingPlanChange ? (
              <View style={styles.planPendingBanner}>
                <Ionicons name="time-outline" size={16} color={Color.piccolo} />
                <View style={styles.planPendingTexts}>
                  <Text style={styles.planPendingTitle}>Nova selecao aguardando confirmacao</Text>
                  <Text style={styles.planPendingDescription}>Finalize salvando os dados para concluir a troca.</Text>
                </View>
              </View>
            ) : null}
            {planErrorMessage ? <Text style={styles.planError}>{planErrorMessage}</Text> : null}
            <TouchableOpacity
              style={styles.planSecondaryAction}
              onPress={() => router.push("/profile/plans")}
              activeOpacity={0.85}
            >
              <Text style={styles.planSecondaryActionText}>Ver detalhes dos planos</Text>
              <Ionicons name="open-outline" size={14} color={Color.piccolo} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Color.mainGoten} />
            ) : (
              <Text style={styles.submitButtonText}>Salvar alteracoes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={isPlanModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleClosePlanModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um plano</Text>
              <TouchableOpacity onPress={handleClosePlanModal} accessibilityLabel="Fechar">
                <Ionicons name="close" size={20} color={Color.mainTrunks} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Compare as opcoes e confirme a que melhor combina com voce.
            </Text>
            {isLoadingPlans ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={Color.piccolo} />
              </View>
            ) : planErrorMessage ? (
              <Text style={styles.modalError}>{planErrorMessage}</Text>
            ) : (
              <ScrollView style={styles.modalPlanList} showsVerticalScrollIndicator={false}>
                {plans.length === 0 ? (
                  <Text style={styles.modalEmpty}>Nenhum plano disponivel no momento.</Text>
                ) : (
                  plans.map((plan) => {
                    const isSelected = (form.planId ?? profile?.plan?.id) === plan.id;
                    return (
                      <TouchableOpacity
                        key={plan.id}
                        style={[styles.modalPlanOption, isSelected && styles.modalPlanOptionSelected]}
                        onPress={() => handleSelectPlanOption(plan)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.modalPlanTexts}>
                          <Text style={styles.modalPlanTitle}>{plan.name}</Text>
                          <Text style={styles.modalPlanDescription}>{plan.description}</Text>
                        </View>
                        <View style={styles.modalPlanMeta}>
                          <Text style={styles.modalPlanPrice}>{formatCurrency(plan.price)}</Text>
                          <Text style={styles.modalPlanDuration}>{`${plan.durationMonths} meses`}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleClearPlanSelection}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={16} color={Color.mainTrunks} />
                <Text style={styles.modalSecondaryButtonText}>Manter plano atual</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryLink}
                onPress={() => {
                  handleClosePlanModal();
                  router.push("/profile/plans");
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryLinkText}>Ver comparativo completo</Text>
                <Ionicons name="open-outline" size={14} color={Color.piccolo} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  keyboardContainer: {
    flex: 1,
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
  sectionTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarPreviewImage: {
    width: "100%",
    height: "100%",
  },
  avatarActions: {
    flex: 1,
    gap: Gap.gap_8,
  },
  avatarPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    backgroundColor: Color.piccolo,
  },
  avatarPrimaryButtonDisabled: {
    opacity: 0.6,
  },
  avatarPrimaryButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  avatarSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px3,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
    gap: Gap.gap_4,
  },
  avatarSecondaryButtonDisabled: {
    opacity: 0.6,
  },
  avatarSecondaryButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  avatarRemoveButton: {
    alignSelf: "flex-start",
  },
  avatarRemoveText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
    textDecorationLine: "underline",
  },
  gallerySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  galleryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  galleryActionButton: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    backgroundColor: Color.mainGohan,
  },
  galleryActionButtonDisabled: {
    opacity: 0.6,
  },
  galleryActionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  galleryActionButtonLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  galleryEmptyHint: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  galleryThumbGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: StyleVariable.px3,
  },
  galleryThumbWrapper: {
    width: 96,
    height: 96,
    borderRadius: Border.br_16,
    overflow: "hidden",
    backgroundColor: Color.mainGoku,
    position: "relative",
  },
  galleryThumbImage: {
    width: "100%",
    height: "100%",
  },
  galleryThumbControls: {
    position: "absolute",
    right: 6,
    bottom: 6,
    gap: Gap.gap_4,
  },
  galleryControlButton: {
    width: 24,
    height: 24,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryControlButtonDisabled: {
    backgroundColor: "rgba(0, 5, 61, 0.3)",
  },
  galleryRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryOrderBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryOrderText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  fieldGroup: {
    gap: Gap.gap_8,
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
  membershipOptions: {
    gap: Gap.gap_16,
  },
  membershipCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
  },
  membershipCardActive: {
    borderColor: Color.piccolo,
    backgroundColor: "rgba(0, 5, 61, 0.05)",
  },
  membershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  membershipTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  membershipDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_12,
  },
  planManageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
  },
  planManageButtonDisabled: {
    opacity: 0.6,
  },
  planManageText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  planName: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
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
  planPendingBanner: {
    marginTop: Gap.gap_12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Gap.gap_12,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: "rgba(0, 78, 255, 0.08)",
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  planPendingTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  planPendingTitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  planPendingDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planError: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.supportiveChichi,
  },
  planSecondaryAction: {
    marginTop: Gap.gap_12,
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
  },
  planSecondaryActionText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    paddingHorizontal: Padding.padding_24,
  },
  modalCard: {
    borderRadius: Border.br_24,
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py6,
    gap: Gap.gap_16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  modalLoading: {
    paddingVertical: StyleVariable.py4,
    alignItems: "center",
  },
  modalError: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.supportiveChichi,
  },
  modalPlanList: {
    maxHeight: 320,
    marginVertical: Gap.gap_8,
  },
  modalEmpty: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
    paddingVertical: StyleVariable.py3,
  },
  modalPlanOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py3,
    gap: Gap.gap_12,
    marginBottom: Gap.gap_12,
  },
  modalPlanOptionSelected: {
    borderColor: Color.piccolo,
    backgroundColor: "rgba(0, 5, 61, 0.05)",
  },
  modalPlanTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  modalPlanTitle: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  modalPlanDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  modalPlanMeta: {
    alignItems: "flex-end",
    gap: Gap.gap_4,
  },
  modalPlanPrice: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  modalPlanDuration: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 5, 61, 0.08)",
    paddingTop: StyleVariable.py3,
    gap: Gap.gap_12,
  },
  modalSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  modalSecondaryButtonText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  modalPrimaryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
  },
  modalPrimaryLinkText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  submitButton: {
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
    minHeight: 54,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
