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
import MaskedTextInput, { Masks } from "react-native-mask-input";
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
import { compressImageForUpload } from "../../services/image";
import { uploadMedia } from "../../services/media";
import {
  deleteUserById,
  getCurrentUser,
  updateCurrentUser,
} from "../../services/users";
import type { UserProfileResponse } from "../../types/api";

const MAX_GALLERY_ITEMS = 4;
const IMAGE_MEDIA_TYPE =
  (ImagePicker as any).MediaType?.Images ??
  (ImagePicker as any).MediaTypeOptions?.Images;

const inferMimeType = (uri: string) => {
  const extension = uri.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "heic") return "image/heic";
  return "image/jpeg";
};

const buildUploadFile = (uri: string, position: number) => ({
  uri,
  name: uri.split("/").pop() ?? `media-${position}.jpg`,
  type: inferMimeType(uri),
});

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const formatPhoneInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return sanitizeDigits(value);
};

const formatBirthDateInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  return trimmed;
};

const parseBirthDateToIso = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const ddmmyyyy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const iso = `${year}-${month}-${day}`;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    const validDay = parsed.getUTCDate() === Number(day);
    const validMonth = parsed.getUTCMonth() + 1 === Number(month);
    if (!validDay || !validMonth) {
      return undefined;
    }
    return iso;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return trimmed;
  }
  return undefined;
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
};

export default function PersonalDataScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
  });
  const [avatar, setAvatar] = useState<ProfileMedia | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<ProfileMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);
  const [isPickingGallery, setIsPickingGallery] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const currentUser = await getCurrentUser();
    return currentUser;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        const userResult = await loadProfile();
        if (!isActive) {
          return;
        }

        try {
          const currentUser = userResult;
          setProfile(currentUser);
          setForm({
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
            phone: formatPhoneInput(currentUser.phone),
            birthDate: formatBirthDateInput(currentUser.birthDate),
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
                : (item.imageUrl ?? `gallery-${item.position}`),
              base64: item.imageBase64 ?? undefined,
              remoteUrl: item.imageUrl ?? undefined,
            }))
            .filter((item) => Boolean(item.uri));
          setGalleryMedia(galleryItems);
        } catch (error) {
          console.error("Failed to load personal data", error);
          setProfile(null);
          setErrorMessage("Não foi possível carregar seus dados.");
        }

        setIsLoading(false);
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [loadProfile]),
  );

  const galleryCountLabel = useMemo(
    () => `${galleryMedia.length}/${MAX_GALLERY_ITEMS}`,
    [galleryMedia.length],
  );
  const planRoleLabel = useMemo(() => {
    if (!profile) {
      return null;
    }
    const planName = profile.plan?.name ?? "";
    const normalized = planName.toLowerCase();
    if (normalized.includes("premium")) {
      return "Premium";
    }
    if (normalized.includes("select")) {
      return "Select";
    }
    if (
      normalized.includes("padrao") ||
      normalized.includes("padrão") ||
      normalized.includes("standard")
    ) {
      return "Standard";
    }
    if (profile.membershipTier === "QUINZE_SELECT") {
      return "Select";
    }
    return "Standard";
  }, [profile?.membershipTier, profile?.plan?.name]);
  const isGalleryFull = galleryMedia.length >= MAX_GALLERY_ITEMS;

  const handleFieldChange = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSelectAvatar = useCallback(async () => {
    if (isPickingAvatar) {
      return;
    }

    setIsPickingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          "Autorize o acesso a galeria para atualizar sua foto de perfil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsMultipleSelection: false,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      const compressedUri = await compressImageForUpload(asset.uri);
      setAvatar({
        id: `avatar-${Date.now()}`,
        uri: compressedUri,
      });
    } catch (error) {
      console.error("Failed to pick avatar media", error);
      setErrorMessage("Não foi possível acessar sua galeria agora.");
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
        setErrorMessage(
          "Autorize o acesso à câmera para atualizar sua foto de perfil.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      const compressedUri = await compressImageForUpload(asset.uri);
      setAvatar({
        id: `avatar-${Date.now()}`,
        uri: compressedUri,
      });
    } catch (error) {
      console.error("Failed to capture avatar media", error);
      setErrorMessage("Não foi possível acessar a câmera agora.");
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
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso a galeria para anexar imagens.");
        return;
      }

      const remainingSlots =
        Math.max(0, MAX_GALLERY_ITEMS - galleryMedia.length) || 1;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
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
        }));
        const merged = [...prev, ...mapped];
        return merged.slice(0, MAX_GALLERY_ITEMS);
      });
    } catch (error) {
      console.error("Failed to pick gallery media", error);
      setErrorMessage("Não foi possível acessar sua galeria agora.");
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
        setErrorMessage("Autorize o acesso à câmera para anexar imagens.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsEditing: true,
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
          },
        ];
        return next.slice(0, MAX_GALLERY_ITEMS);
      });
    } catch (error) {
      console.error("Failed to capture gallery media", error);
      setErrorMessage("Não foi possível acessar a câmera agora.");
    } finally {
      setIsPickingGallery(false);
    }
  }, [galleryMedia.length, isPickingGallery]);

  const handleRemoveGalleryItem = useCallback((id: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGalleryMedia((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleMoveGalleryItem = useCallback(
    (id: string, direction: "up" | "down") => {
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
    },
    [],
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalVisible(false);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting || !profile?.id) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteUserById(profile.id);
    } catch (error) {
      console.error("Failed to delete account", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setSuccessMessage("Conta excluida com sucesso.");
      router.replace("/login");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSaving) {
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Informe seu nome completo.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Informe um email válido.");
      return;
    }

    const sanitizedPhone = sanitizePhonePayload(form.phone ?? "");
    if (!sanitizedPhone) {
      setErrorMessage("Informe um telefone válido.");
      return;
    }

    const parsedBirthDate = form.birthDate.trim()
      ? parseBirthDateToIso(form.birthDate)
      : undefined;
    if (form.birthDate.trim() && !parsedBirthDate) {
      setErrorMessage("Informe a data de nascimento em DD/MM/AAAA.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let avatarUrlCandidate =
        avatar?.remoteUrl ??
        (avatar?.uri && avatar.uri.startsWith("http") ? avatar.uri : undefined);

      if (!avatarUrlCandidate && avatar?.uri) {
        const uploaded = await uploadMedia(
          buildUploadFile(avatar.uri, 0),
          "profile",
        );
        avatarUrlCandidate = uploaded.url ?? uploaded.path;
      }

      const galleryPayload: Array<{ position: number; imageUrl: string }> = [];
      for (let index = 0; index < galleryMedia.length; index += 1) {
        const item = galleryMedia[index];
        const remoteUrl =
          item.remoteUrl ??
          (item.uri && item.uri.startsWith("http") ? item.uri : undefined);

        if (remoteUrl) {
          galleryPayload.push({ position: index + 1, imageUrl: remoteUrl });
          continue;
        }

        if (item.uri) {
          const uploaded = await uploadMedia(
            buildUploadFile(item.uri, index + 1),
            "gallery",
          );
          const imageUrl = uploaded.url ?? uploaded.path;
          if (!imageUrl) {
            throw new Error("Gallery upload failed");
          }
          galleryPayload.push({ position: index + 1, imageUrl });
        }
      }
      const normalizedBirthDate = parsedBirthDate;
      const hasExistingGallery = (profile?.gallery?.length ?? 0) > 0;
      const shouldSendGallery =
        galleryPayload.length > 0 ||
        (hasExistingGallery && galleryMedia.length === 0);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        membershipTier: profile?.membershipTier ?? "QUINZE_STANDARD",
        ...(avatar === null
          ? { profilePictureUrl: null }
          : avatarUrlCandidate
            ? { profilePictureUrl: avatarUrlCandidate }
            : {}),
        phone: sanitizedPhone,
        ...(normalizedBirthDate ? { birthDate: normalizedBirthDate } : {}),
        ...(profile?.plan?.id ? { planId: profile.plan.id } : {}),
        ...(shouldSendGallery ? { gallery: galleryPayload } : {}),
      };

      console.log("PUT /users/me payload", payload);

      const updated = await updateCurrentUser(payload);
      setProfile(updated);
      setForm({
        name: updated.name ?? payload.name,
        email: updated.email ?? payload.email,
        phone: formatPhoneInput(updated.phone),
        birthDate: formatBirthDateInput(updated.birthDate),
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
            : (item.imageUrl ?? `gallery-${item.position}`),
          base64: item.imageBase64 ?? undefined,
          remoteUrl: item.imageUrl ?? undefined,
        }));
      setGalleryMedia(updatedGallery);
      setSuccessMessage("Dados atualizados com sucesso.");
    } catch (error) {
      console.error("Failed to update personal data", error);
      setErrorMessage("Não foi possível salvar suas alteracoes.");
    } finally {
      setIsSaving(false);
    }
  }, [avatar, form, galleryMedia, isSaving]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
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

          {profile ? (
            <View style={styles.planRoleCard}>
              <Text style={styles.sectionTitle}>Plano atual</Text>
              <Text style={styles.planRoleLabel}>
                {planRoleLabel ?? "Plano Não identificado"}
              </Text>
              <Text style={styles.planRoleMeta}>
                {profile.plan?.name ??
                  (profile.membershipTier === "QUINZE_SELECT"
                    ? "Quinze Select"
                    : "Clube Quinze")}
              </Text>
              <Text style={styles.planRoleDescription}>
                {profile.plan?.description ??
                  "Planos disponiveis: Standard, Premium e Select."}
              </Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Imagem e galeria</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarPreview}>
                {avatar ? (
                  <Image
                    source={{ uri: avatar.uri }}
                    style={styles.avatarPreviewImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={28} color={Color.mainTrunks} />
                )}
              </View>
              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={[
                    styles.avatarPrimaryButton,
                    isPickingAvatar && styles.avatarPrimaryButtonDisabled,
                  ]}
                  onPress={handleSelectAvatar}
                  activeOpacity={0.85}
                  disabled={isPickingAvatar}
                >
                  {isPickingAvatar ? (
                    <ActivityIndicator size="small" color={Color.mainGoten} />
                  ) : (
                    <Text style={styles.avatarPrimaryButtonText}>
                      Atualizar foto
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.avatarSecondaryButton,
                    isPickingAvatar && styles.avatarSecondaryButtonDisabled,
                  ]}
                  onPress={handleCaptureAvatar}
                  activeOpacity={0.85}
                  disabled={isPickingAvatar}
                >
                  <Ionicons
                    name="camera-outline"
                    size={14}
                    color={Color.piccolo}
                  />
                  <Text style={styles.avatarSecondaryButtonText}>
                    Usar câmera
                  </Text>
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
              <Text style={styles.fieldLabel}>
                Galeria ({galleryCountLabel})
              </Text>
              <View style={styles.galleryActions}>
                <TouchableOpacity
                  style={[
                    styles.galleryActionButton,
                    (isPickingGallery || isGalleryFull) &&
                      styles.galleryActionButtonDisabled,
                  ]}
                  onPress={handleCaptureGalleryMedia}
                  activeOpacity={0.85}
                  disabled={isPickingGallery || isGalleryFull}
                >
                  {isPickingGallery ? (
                    <ActivityIndicator size="small" color={Color.piccolo} />
                  ) : (
                    <View style={styles.galleryActionButtonContent}>
                      <Ionicons
                        name="camera-outline"
                        size={16}
                        color={Color.piccolo}
                      />
                      <Text style={styles.galleryActionButtonLabel}>
                        {isGalleryFull ? "Limite atingido" : "Capturar"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.galleryActionButton,
                    (isPickingGallery || isGalleryFull) &&
                      styles.galleryActionButtonDisabled,
                  ]}
                  onPress={handleAddGalleryMedia}
                  activeOpacity={0.85}
                  disabled={isPickingGallery || isGalleryFull}
                >
                  {isPickingGallery ? (
                    <ActivityIndicator size="small" color={Color.piccolo} />
                  ) : (
                    <View style={styles.galleryActionButtonContent}>
                      <Ionicons
                        name="images-outline"
                        size={16}
                        color={Color.piccolo}
                      />
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
                Selecione ate {MAX_GALLERY_ITEMS} imagens para mostrar seu
                estilo no app.
              </Text>
            ) : (
              <View style={styles.galleryThumbGrid}>
                {galleryMedia.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === galleryMedia.length - 1;
                  return (
                    <View key={item.id} style={styles.galleryThumbWrapper}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.galleryThumbImage}
                        contentFit="cover"
                      />
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
                        <Ionicons
                          name="close"
                          size={12}
                          color={Color.mainGoten}
                        />
                      </TouchableOpacity>
                      <View style={styles.galleryThumbControls}>
                        <TouchableOpacity
                          style={[
                            styles.galleryControlButton,
                            isFirst && styles.galleryControlButtonDisabled,
                          ]}
                          onPress={() => handleMoveGalleryItem(item.id, "up")}
                          disabled={isFirst}
                          accessibilityLabel="Mover imagem para cima"
                        >
                          <Ionicons
                            name="chevron-up"
                            size={14}
                            color={Color.mainGoten}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.galleryControlButton,
                            isLast && styles.galleryControlButtonDisabled,
                          ]}
                          onPress={() => handleMoveGalleryItem(item.id, "down")}
                          disabled={isLast}
                          accessibilityLabel="Mover imagem para baixo"
                        >
                          <Ionicons
                            name="chevron-down"
                            size={14}
                            color={Color.mainGoten}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>informações pessoais</Text>
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
                onChangeText={(masked: string) =>
                  handleFieldChange("phone", masked)
                }
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
                onChangeText={(masked: string) =>
                  handleFieldChange("birthDate", masked)
                }
                mask={[
                  /\d/,
                  /\d/,
                  "/",
                  /\d/,
                  /\d/,
                  "/",
                  /\d/,
                  /\d/,
                  /\d/,
                  /\d/,
                ]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Color.mainTrunks}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSaving && styles.submitButtonDisabled,
            ]}
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

          <View style={styles.dangerCard}>
            <Text style={styles.sectionTitle}>Exclusão de conta</Text>
            <Text style={styles.dangerText}>
              Esta ação remove seu acesso e apaga seus dados do aplicativo.
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleOpenDeleteModal}
              activeOpacity={0.85}
            >
              <Text style={styles.deleteButtonText}>Excluir conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDeleteModal}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleCloseDeleteModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Confirmar exclusao</Text>
            <Text style={styles.modalDescription}>
              Tem certeza que deseja excluir sua conta? Esta acao e
              irreversivel.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={handleCloseDeleteModal}
                activeOpacity={0.85}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmDanger}
                onPress={handleConfirmDelete}
                activeOpacity={0.9}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Color.mainGoten} />
                ) : (
                  <Text style={styles.modalConfirmText}>Excluir</Text>
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
  planRoleCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_8,
  },
  planRoleLabel: {
    fontSize: FontSize.fs_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  planRoleMeta: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  planRoleDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    opacity: 0.8,
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
  dangerCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(255, 78, 100, 0.3)",
    backgroundColor: "rgba(255, 78, 100, 0.06)",
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    gap: Gap.gap_12,
  },
  dangerText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  deleteButton: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.supportiveChichi,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: StyleVariable.py2,
  },
  deleteButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.supportiveChichi,
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
  modalDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
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
  modalConfirmDanger: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_10,
    backgroundColor: Color.supportiveChichi,
  },
  modalConfirmText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
