import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
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
    StyleVariable
} from "../../GlobalStyles";
import { listPreferences, upsertPreference } from "../../services/preferences";
import { getCurrentUser, updateCurrentUser } from "../../services/users";
import type { UserProfileResponse } from "../../types/api";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [frequencyDays, setFrequencyDays] = useState<"7" | "15">("7");
  const [frequencyTime, setFrequencyTime] = useState<Date>(() => {
    const seed = new Date();
    seed.setHours(9, 0, 0, 0);
    return seed;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

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
            birthDate: currentUser.birthDate ?? "",
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

          try {
            const prefs = await listPreferences();
            const freqValue = prefs.find((item) => item.key === "frequency_days")?.value;
            const freqTimeValue = prefs.find((item) => item.key === "frequency_time")?.value;
            if (freqValue === "7" || freqValue === "15") {
              setFrequencyDays(freqValue);
            }
            if (typeof freqTimeValue === "string" && /^\d{2}:\d{2}$/.test(freqTimeValue)) {
              const [hh, mm] = freqTimeValue.split(":").map((v) => Number(v));
              if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
                const d = new Date();
                d.setHours(hh, mm, 0, 0);
                setFrequencyTime(d);
              }
            }
          } catch (prefError) {
            console.warn("Failed to load preferences", prefError);
          }
        } catch (error) {
          console.error("Failed to load personal data", error);
          setProfile(null);
          setErrorMessage("Nao foi possivel carregar seus dados.");
        }

        setIsLoading(false);
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [loadProfile]),
  );

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
      });
      const safeTime = `${frequencyTime.getHours().toString().padStart(2, "0")}:${frequencyTime.getMinutes().toString().padStart(2, "0")}`;
      await Promise.allSettled([
        upsertPreference({ key: "frequency_days", value: frequencyDays }),
        upsertPreference({ key: "frequency_time", value: safeTime }),
      ]);
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
  }, [avatar, form, frequencyDays, frequencyTime, galleryMedia, isSaving]);

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
                onChangeText={(masked: string) => handleFieldChange("phone", masked)}
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
                onChangeText={(masked: string) => handleFieldChange("birthDate", masked)}
                mask={Masks.DATE_YYYYMMDD}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Color.mainTrunks}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Frequencia de atendimento</Text>
              <View style={styles.frequencyRow}>
                <TouchableOpacity
                  style={[styles.frequencyChip, frequencyDays === "7" && styles.frequencyChipActive]}
                  onPress={() => setFrequencyDays("7")}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.frequencyChipText, frequencyDays === "7" && styles.frequencyChipTextActive]}>
                    1 vez / 7 dias
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyChip, frequencyDays === "15" && styles.frequencyChipActive]}
                  onPress={() => setFrequencyDays("15")}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.frequencyChipText, frequencyDays === "15" && styles.frequencyChipTextActive]}>
                    1 vez / 15 dias
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldLabel}>Horario preferido</Text>
              <TouchableOpacity
                style={styles.fieldInput}
                onPress={() => setShowTimePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Selecionar horario preferido"
                activeOpacity={0.85}
              >
                <Text style={styles.timeValue}>
                  {`${frequencyTime.getHours().toString().padStart(2, "0")}:${frequencyTime.getMinutes().toString().padStart(2, "0")}`}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={frequencyTime}
                  mode="time"
                  is24Hour
                  display="default"
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    if (event.type === "dismissed") {
                      if (Platform.OS !== "ios") {
                        setShowTimePicker(false);
                      }
                      return;
                    }
                    const current = selectedDate || frequencyTime;
                    setFrequencyTime(current);
                    setShowTimePicker(Platform.OS === "ios");
                  }}
                />
              )}
            </View>
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
  frequencyRow: {
    flexDirection: "row",
    gap: StyleVariable.gap2,
  },
  frequencyChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGoten,
    borderRadius: Border.br_16,
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px2,
    alignItems: "center",
  },
  frequencyChipActive: {
    borderColor: Color.piccolo,
    backgroundColor: "#E7F6FF",
  },
  frequencyChipText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  frequencyChipTextActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  timeValue: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
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
