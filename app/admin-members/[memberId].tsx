import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
import api from "../../services/api";
import {
    cancelAppointment,
    listAppointments,
} from "../../services/appointments";
import { compressImageForUpload } from "../../services/image";
import { findMemberById } from "../../services/mock/admin-members";
import { isMockEnabled } from "../../services/mock/settings";
import * as ImagePicker from "expo-image-picker";
import { listPlans } from "../../services/plans";
import { uploadMedia } from "../../services/media";
import { getUserById, updateUserById } from "../../services/users";
import type {
    AppointmentResponse,
    PlanResponse,
    UpdateUserRequest,
    UserProfileResponse,
} from "../../types/api";

type RenewValue = "1m" | "3m" | "6m" | "12m";

const photoPlaceholders = [{ id: 1 }, { id: 2 }, { id: 3 }];

const renewOptions: Array<{ label: string; value: RenewValue }> = [
  { label: "1 mês", value: "1m" },
  { label: "3 meses", value: "3m" },
  { label: "6 meses", value: "6m" },
  { label: "1 ano", value: "12m" },
];

const getApiOrigin = () => {
  const base = api.defaults.baseURL ?? "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
};

const normalizeImageUri = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:image")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  const origin = getApiOrigin();
  if (!origin) return trimmed;
  if (trimmed.startsWith("/")) return `${origin}${trimmed}`;
  return `${origin}/${trimmed}`;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const addMonths = (base: Date, months: number) => {
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next;
};

const mapPlanToTier = (
  plan: PlanResponse,
  fallback: UserProfileResponse["membershipTier"],
) => {
  const name = plan.name.toLowerCase();
  if (name.includes("select")) return "QUINZE_SELECT";
  if (name.includes("premium")) return "QUINZE_PREMIUM";
  if (name.includes("standard")) return "QUINZE_STANDARD";
  return fallback;
};

export default function AdminMemberDetailScreen() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();

  const [renewVisible, setRenewVisible] = useState(false);
  const [renewSelection, setRenewSelection] = useState<RenewValue>("1m");
  const [planVisible, setPlanVisible] = useState(false);
  const [planOptions, setPlanOptions] = useState<PlanResponse[]>([]);
  const [planOptionsError, setPlanOptionsError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [endDateOverride, setEndDateOverride] = useState<Date | null>(null);
  const [galleryPreviewUri, setGalleryPreviewUri] = useState<string | null>(
    null,
  );
  const [galleryPreviewIndex, setGalleryPreviewIndex] = useState<number | null>(null);
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<UserProfileResponse | undefined>(
    undefined,
  );
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<
    number | null
  >(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isRemovingGalleryIndex, setIsRemovingGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchMember = async () => {
      const idNumber = Number(memberId);
      if (Number.isNaN(idNumber)) return;
      if (isMockEnabled()) {
        const mock = findMemberById(idNumber);
        if (isActive && mock) {
          setMember({
            id: mock.id,
            name: mock.name,
            email: "",
            phone: "",
            birthDate: "",
            membershipTier: mock.membershipTier,
            role:
              mock.membershipTier === "QUINZE_SELECT"
                ? "CLUB_SELECT"
                : "CLUB_STANDARD",
            plan: undefined,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            nextAppointment: undefined,
            preferences: [],
            profilePictureUrl: undefined,
            profilePictureBase64: undefined,
            gallery: [],
          });
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const user = await getUserById(idNumber);
        if (!isActive) return;
        setMember(user);
      } catch (err) {
        console.error("Failed to load member", err);
        if (isActive) setError("Não foi possível carregar o membro.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchMember();
    return () => {
      isActive = false;
    };
  }, [memberId]);

  useEffect(() => {
    let isActive = true;
    const loadPlans = async () => {
      if (!member?.id) return;
      setPlanOptionsError(null);
      try {
        const list = await listPlans();
        if (!isActive) return;
        setPlanOptions(list);
        setSelectedPlanId(member.plan?.id ?? null);
      } catch (loadError) {
        console.error("Failed to load plans", loadError);
        if (isActive) {
          setPlanOptions([]);
          setPlanOptionsError("Não foi possível carregar os planos.");
        }
      }
    };

    setEndDateOverride(null);
    loadPlans();

    return () => {
      isActive = false;
    };
  }, [member?.id, member?.plan?.id]);

  useEffect(() => {
    let isActive = true;

    const loadAppointments = async () => {
      if (!member?.id) {
        if (isActive) {
          setAppointments([]);
        }
        return;
      }

      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const page = await listAppointments({
          clientId: member.id,
          status: "SCHEDULED",
          page: 0,
          size: 10,
        });
        const now = Date.now();
        const upcoming = (page.content ?? [])
          .filter((appointment) => {
            const time = new Date(appointment.scheduledAt).getTime();
            return !Number.isNaN(time) && time >= now;
          })
          .sort(
            (first, second) =>
              new Date(first.scheduledAt).getTime() -
              new Date(second.scheduledAt).getTime(),
          );
        if (isActive) {
          setAppointments(upcoming);
        }
      } catch (appointmentsErr) {
        console.error("Failed to load member appointments", appointmentsErr);
        if (isActive) {
          setAppointments([]);
          setAppointmentsError(
            "Não foi possível carregar os próximos atendimentos.",
          );
        }
      } finally {
        if (isActive) {
          setAppointmentsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isActive = false;
    };
  }, [member?.id]);

  const derived = useMemo(() => {
    if (!member) {
      return {
        name: "",
        email: "",
        idade: "",
        preferências: "",
        agendamentoStatus: "",
        planoLabel: "",
        userStatus: "",
        encerramento: "",
      };
    }

    const planLabel =
      member.membershipTier === "QUINZE_SELECT"
        ? "Quinze Select"
        : member.plan?.name || "Clube Quinze";

    const baseDate = member.createdAt ? new Date(member.createdAt) : null;
    const durationMonths = member.plan?.durationMonths;
    const computedEndDate =
      endDateOverride ??
      (baseDate && durationMonths ? addMonths(baseDate, durationMonths) : null);

    return {
      name: member.name,
      email: member.email ?? "",
      idade: member.birthDate ?? "",
      preferências: member.preferences?.map((p) => p.value).join(", ") ?? "",
      agendamentoStatus: member.nextAppointment?.status ?? "",
      planoLabel: planLabel,
      userStatus: member.role ?? "",
      encerramento: computedEndDate ? formatDateLabel(computedEndDate) : "",
    };
  }, [endDateOverride, member]);

  const avatarInitials = useMemo(() => {
    if (!member?.name) return "";
    return member.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  }, [member?.name]);

  const avatarSource = useMemo(() => {
    const profileUrl = normalizeImageUri(member?.profilePictureUrl);
    if (profileUrl) {
      return { uri: profileUrl };
    }
    if (member?.profilePictureBase64) {
      const base64 = member.profilePictureBase64.trim();
      if (!base64) return null;
      const uri = base64.startsWith("data:image")
        ? base64
        : `data:image/jpeg;base64,${base64}`;
      return { uri };
    }
    const galleryItem = member?.gallery?.[0];
    const galleryUrl = normalizeImageUri(galleryItem?.imageUrl);
    if (galleryUrl) {
      return { uri: galleryUrl };
    }
    if (galleryItem?.imageBase64) {
      const base64 = galleryItem.imageBase64.trim();
      if (!base64) return null;
      const uri = base64.startsWith("data:image")
        ? base64
        : `data:image/jpeg;base64,${base64}`;
      return { uri };
    }
    return null;
  }, [
    member?.gallery,
    member?.profilePictureBase64,
    member?.profilePictureUrl,
  ]);

  const roleLabel = useMemo(() => {
    if (!member) return "";
    const planName = member.plan?.name?.trim();
    if (planName) return planName;
    if (member.membershipTier === "QUINZE_SELECT") return "Select";
    if (member.membershipTier === "QUINZE_PREMIUM") return "Premium";
    return "";
  }, [member]);

  const formatAppointmentDate = (iso?: string) => {
    if (!iso) {
      return "";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatAppointmentTime = (iso?: string) => {
    if (!iso) {
      return "";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenRenew = () => {
    setRenewSelection("1m");
    setRenewVisible(true);
  };

  const handleConfirmRenew = () => {
    const picked = renewOptions.find((opt) => opt.value === renewSelection);
    setRenewVisible(false);
    if (picked) {
      const months = Number(picked.value.replace("m", ""));
      const endDate = addMonths(new Date(), months);
      setEndDateOverride(endDate);
      Alert.alert(
        "Renovação",
        `Plano renovado por ${picked.label}. Encerramento: ${formatDateLabel(endDate)}.`,
      );
    }
  };

  const handleOpenPlanChange = () => {
    setPlanOptionsError(null);
    setSelectedPlanId(member?.plan?.id ?? null);
    setPlanVisible(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!member || isUpdatingPlan) {
      return;
    }

    if (!selectedPlanId) {
      setPlanOptionsError("Selecione um plano para continuar.");
      return;
    }

    const selectedPlan = planOptions.find((plan) => plan.id === selectedPlanId);
    if (!selectedPlan) {
      setPlanOptionsError("Plano selecionado não encontrado.");
      return;
    }

    setIsUpdatingPlan(true);
    setPlanOptionsError(null);

    const nextTier = mapPlanToTier(selectedPlan, member.membershipTier);
    const payload: UpdateUserRequest = {
      name: member.name,
      email: member.email ?? "",
      phone: member.phone ?? undefined,
      birthDate: member.birthDate ?? undefined,
      membershipTier: nextTier,
      planId: selectedPlan.id,
      profilePictureUrl: member.profilePictureUrl ?? undefined,
      profilePictureBase64: member.profilePictureBase64 ?? undefined,
      gallery: member.gallery ?? undefined,
    };

    try {
      const updated = await updateUserById(member.id, payload);
      setMember(updated);
      setPlanVisible(false);
      const endDate = addMonths(new Date(), selectedPlan.durationMonths);
      setEndDateOverride(endDate);
      Alert.alert(
        "Plano atualizado",
        "Plano do usuário atualizado com sucesso.",
      );
    } catch (updateError) {
      console.error("Failed to update member plan", updateError);
      setPlanOptionsError("Não foi possível atualizar o plano.");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleScheduleForMember = () => {
    if (!member) {
      return;
    }
    router.push({
      pathname: "/schedule",
      params: {
        clientId: String(member.id),
        tier: member.membershipTier,
      },
    });
  };

  const handleReschedule = (appointment: AppointmentResponse) => {
    router.push({
      pathname: "/schedule",
      params: {
        appointmentId: String(appointment.id),
        clientId: String(appointment.clientId),
        tier: appointment.appointmentTier,
      },
    });
  };

  const handleCancel = (appointment: AppointmentResponse) => {
    Alert.alert(
      "Cancelar atendimento",
      "Tem certeza que deseja cancelar este atendimento?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: async () => {
            setUpdatingAppointmentId(appointment.id);
            try {
              await cancelAppointment(appointment.id);
              setAppointments((prev) =>
                prev.filter((item) => item.id !== appointment.id),
              );
            } catch (cancelError) {
              console.error("Failed to cancel appointment", cancelError);
              Alert.alert(
                "Não foi possível cancelar",
                "Tente novamente em instantes.",
              );
            } finally {
              setUpdatingAppointmentId(null);
            }
          },
        },
      ],
    );
  };

  const handleOpenGalleryPreview = (uri: string, index: number) => {
    setGalleryPreviewUri(uri);
    setGalleryPreviewIndex(index);
    setIsGalleryModalVisible(true);
  };

  const handleCloseGalleryPreview = () => {
    setIsGalleryModalVisible(false);
    setGalleryPreviewUri(null);
    setGalleryPreviewIndex(null);
  };

  const IMAGE_MEDIA_TYPE =
    (ImagePicker as any).MediaType?.Images ??
    (ImagePicker as any).MediaTypeOptions?.Images;

  const handleAddGalleryMedia = async () => {
    if (isPickingImage || !member) return;

    if (member.gallery && member.gallery.length >= 4) {
      Alert.alert("Limite atingido", "O membro já possui o limite de 4 fotos.");
      return;
    }

    setIsPickingImage(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permissão negada", "Autorize o acesso a galeria para anexar imagens.");
        return;
      }

      const remainingSlots = Math.max(0, 4 - (member.gallery?.length ?? 0)) || 1;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_MEDIA_TYPE,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const nextGallery = [...(member.gallery || [])];
      let hasError = false;

      for (let i = 0; i < result.assets.length; i++) {
        if (nextGallery.length >= 4) break;
        const asset = result.assets[i];

        try {
          // Comprime/redimensiona (saída sempre JPEG) antes do upload.
          const uploadUri = await compressImageForUpload(asset.uri);

          const uploaded = await uploadMedia(
            {
              uri: uploadUri,
              name: `gallery-${Date.now()}-${i}.jpg`,
              type: "image/jpeg",
            },
            "gallery"
          );
          
          const imageUrl = uploaded.url ?? uploaded.path;
          if (imageUrl) {
            nextGallery.push({
              position: nextGallery.length + 1,
              imageUrl,
            });
          }
        } catch (uploadErr) {
          console.error("Failed to upload image", uploadErr);
          hasError = true;
        }
      }

      if (hasError) {
        Alert.alert("Aviso", "Algumas imagens não puderam ser enviadas.");
      }

      const payload: UpdateUserRequest = {
        name: member.name,
        email: member.email ?? "",
        phone: member.phone ?? undefined,
        birthDate: member.birthDate ?? undefined,
        membershipTier: member.membershipTier,
        planId: member.plan?.id ?? undefined,
        gallery: nextGallery,
      };

      const updated = await updateUserById(member.id, payload);
      setMember(updated);
      Alert.alert("Sucesso", "Fotos atualizadas.");
      
    } catch (error) {
      console.error("Failed to pick gallery media", error);
      Alert.alert("Erro", "Não foi possível acessar a galeria.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!member || isRemovingGalleryIndex !== null) return;
    
    Alert.alert("Remover foto", "Tem certeza que deseja remover esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          setIsRemovingGalleryIndex(index);
          try {
            const currentGallery = member.gallery || [];
            const nextGallery = currentGallery.filter((_, i) => i !== index).map((item, i) => ({
              ...item,
              position: i + 1,
            }));
            
            const payload: UpdateUserRequest = {
              name: member.name,
              email: member.email ?? "",
              phone: member.phone ?? undefined,
              birthDate: member.birthDate ?? undefined,
              membershipTier: member.membershipTier,
              planId: member.plan?.id ?? undefined,
              gallery: nextGallery,
            };

            const updated = await updateUserById(member.id, payload);
            setMember(updated);
          } catch (error) {
            console.error("Failed to remove gallery image", error);
            Alert.alert("Erro", "Não foi possível remover a foto.");
          } finally {
            setIsRemovingGalleryIndex(null);
          }
        }
      }
    ]);
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
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={20} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color={Color.piccolo} />
            <Text style={styles.emptyText}>Carregando membro...</Text>
          </View>
        ) : !member ? (
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
            {error ? (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{error}</Text>
              </View>
            ) : null}
            <View style={styles.centerBlock}>
              <View style={styles.avatarLarge}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarLargeLabel}>{avatarInitials}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.memberName,
                  roleLabel.toLowerCase().includes("select")
                    ? styles.memberNameSelect
                    : null,
                ]}
              >
                {member.name}
              </Text>
              {roleLabel ? (
                <Text style={styles.memberPlan}>{roleLabel}</Text>
              ) : null}
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
                  <Text style={styles.infoValue}>{derived.preferências}</Text>
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
                  <Text style={styles.infoLabel}>Encerramento</Text>
                  <Text style={styles.infoValue}>{derived.encerramento}</Text>
                </View>
                <TouchableOpacity
                  style={styles.renewButton}
                  activeOpacity={0.85}
                  onPress={handleOpenRenew}
                >
                  <Text style={styles.renewButtonText}>Fazer Renovação</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changePlanButton}
                  activeOpacity={0.85}
                  onPress={handleOpenPlanChange}
                >
                  <Text style={styles.changePlanButtonText}>Trocar plano</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.cardTitle}>Agendamento</Text>
              <View style={styles.card}>
                <Text style={styles.helperText}>
                  Marque um novo atendimento para este membro.
                </Text>
                <TouchableOpacity
                  style={styles.scheduleButton}
                  activeOpacity={0.85}
                  onPress={handleScheduleForMember}
                >
                  <Text style={styles.scheduleButtonText}>
                    Agendar atendimento
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.cardTitle}>Próximos atendimentos</Text>
              <View style={styles.card}>
                {appointmentsLoading ? (
                  <View style={styles.appointmentEmpty}>
                    <ActivityIndicator size="small" color={Color.piccolo} />
                    <Text style={styles.helperText}>Carregando...</Text>
                  </View>
                ) : appointmentsError ? (
                  <View style={styles.feedbackBanner}>
                    <Text style={styles.feedbackText}>{appointmentsError}</Text>
                  </View>
                ) : appointments.length === 0 ? (
                  <View style={styles.appointmentEmpty}>
                    <Text style={styles.helperText}>
                      Nenhum atendimento agendado.
                    </Text>
                  </View>
                ) : (
                  appointments.map((appointment) => {
                    const isUpdating = updatingAppointmentId === appointment.id;
                    return (
                      <View key={appointment.id} style={styles.appointmentRow}>
                        <View style={styles.appointmentInfo}>
                          <Text style={styles.appointmentDate}>
                            {formatAppointmentDate(appointment.scheduledAt)}
                          </Text>
                          <Text style={styles.appointmentTime}>
                            {formatAppointmentTime(appointment.scheduledAt)}
                          </Text>
                        </View>
                        <View style={styles.appointmentActions}>
                          <TouchableOpacity
                            style={styles.appointmentActionButton}
                            activeOpacity={0.85}
                            onPress={() => handleReschedule(appointment)}
                            disabled={isUpdating}
                          >
                            <Text style={styles.appointmentActionText}>
                              Remarcar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.appointmentActionButton,
                              styles.appointmentActionDanger,
                            ]}
                            activeOpacity={0.85}
                            onPress={() => handleCancel(appointment)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <ActivityIndicator
                                size="small"
                                color={Color.supportiveChichi}
                              />
                            ) : (
                              <Text
                                style={[
                                  styles.appointmentActionText,
                                  styles.appointmentActionTextDanger,
                                ]}
                              >
                                Cancelar
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={[styles.infoRow, { paddingHorizontal: 0, paddingBottom: Gap.gap_12 }]}>
                <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Fotos</Text>
                {(!member.gallery || member.gallery.length < 4) && (
                  <TouchableOpacity 
                    onPress={handleAddGalleryMedia} 
                    disabled={isPickingImage}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: Gap.gap_4 }}
                  >
                    {isPickingImage ? (
                      <ActivityIndicator size="small" color={Color.piccolo} />
                    ) : (
                      <>
                        <Ionicons name="add-circle-outline" size={20} color={Color.piccolo} />
                        <Text style={{ color: Color.piccolo, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_12 }}>Adicionar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {member.gallery && member.gallery.length > 0 ? (
                  member.gallery.map((item, index) => {
                    const imageUri =
                      normalizeImageUri(item.imageUrl) ??
                      (item.imageBase64
                        ? item.imageBase64.startsWith("data:image")
                          ? item.imageBase64
                          : `data:image/jpeg;base64,${item.imageBase64}`
                        : null);
                    
                    const isRemoving = isRemovingGalleryIndex === index;

                    return (
                      <View key={item.id ?? `gallery-${index}`} style={{ position: 'relative' }}>
                        <TouchableOpacity
                          style={[styles.photoCard, isRemoving && { opacity: 0.5 }]}
                          activeOpacity={imageUri ? 0.85 : 1}
                          onPress={() => {
                            if (imageUri) {
                              handleOpenGalleryPreview(imageUri, index);
                            }
                          }}
                          disabled={!imageUri || isRemoving}
                        >
                          {imageUri ? (
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.photoImage}
                            />
                          ) : (
                            <Ionicons
                              name="image-outline"
                              size={24}
                              color={Color.mainTrunks}
                            />
                          )}
                        </TouchableOpacity>
                        
                        {isRemoving && (
                           <ActivityIndicator size="small" color={Color.piccolo} style={{ position: 'absolute', top: '40%', left: '40%' }} />
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.photoEmpty}>
                    <Text style={styles.helperText}>
                      Nenhuma foto cadastrada.
                    </Text>
                  </View>
                )}
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

      <Modal
        visible={planVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlanVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPlanVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Trocar plano</Text>
            <Text style={styles.modalSubtitle}>
              Selecione o plano para este usuário
            </Text>

            {planOptionsError ? (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{planOptionsError}</Text>
              </View>
            ) : null}

            <View style={styles.optionGrid}>
              {planOptions.map((plan) => {
                const active = selectedPlanId === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.optionButton,
                      styles.planOptionButton,
                      active && styles.optionButtonActive,
                    ]}
                    onPress={() => setSelectedPlanId(plan.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        styles.planOptionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {plan.name}
                    </Text>
                    <Text style={styles.planOptionMeta}>
                      {`${plan.durationMonths} meses`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setPlanVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleConfirmPlanChange}
                activeOpacity={0.9}
                disabled={isUpdatingPlan}
              >
                {isUpdatingPlan ? (
                  <ActivityIndicator size="small" color={Color.mainGoten} />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isGalleryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseGalleryPreview}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleCloseGalleryPreview}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.galleryModalCard}
            onPress={() => {}}
          >
            {galleryPreviewUri ? (
              <Image
                source={{ uri: galleryPreviewUri }}
                style={styles.galleryModalImage}
              />
            ) : null}
            <View style={[styles.modalActions, { marginTop: Gap.gap_16 }]}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={handleCloseGalleryPreview}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Fechar</Text>
              </TouchableOpacity>
              {galleryPreviewIndex !== null && (
                <TouchableOpacity
                  style={[styles.modalConfirm, { backgroundColor: Color.supportiveChichi }]}
                  onPress={() => {
                    handleCloseGalleryPreview();
                    handleRemoveGalleryImage(galleryPreviewIndex);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalConfirmText}>Remover</Text>
                </TouchableOpacity>
              )}
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
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  memberNameSelect: {
    color: "#C9A227",
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
  changePlanButton: {
    marginTop: Gap.gap_8,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    alignItems: "center",
    backgroundColor: Color.mainGohan,
  },
  changePlanButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  helperText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  scheduleButton: {
    marginTop: Gap.gap_12,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_10,
    backgroundColor: Color.piccolo,
    alignItems: "center",
  },
  scheduleButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  appointmentRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: Gap.gap_8,
    paddingVertical: StyleVariable.py2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 5, 61, 0.08)",
  },
  appointmentInfo: {
    flex: 1,
    gap: Gap.gap_4,
  },
  appointmentDate: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  appointmentTime: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: Gap.gap_8,
  },
  appointmentActionButton: {
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px3,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    backgroundColor: Color.mainGohan,
  },
  appointmentActionText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  appointmentActionDanger: {
    borderColor: Color.supportiveChichi,
    backgroundColor: "rgba(255, 78, 100, 0.08)",
  },
  appointmentActionTextDanger: {
    color: Color.supportiveChichi,
  },
  appointmentEmpty: {
    alignItems: "center",
    gap: Gap.gap_8,
    paddingVertical: StyleVariable.py2,
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
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoEmpty: {
    justifyContent: "center",
    paddingVertical: StyleVariable.py2,
  },
  galleryModalCard: {
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
  galleryModalImage: {
    width: "100%",
    height: 320,
    borderRadius: Border.br_12,
    backgroundColor: Color.mainGohan,
    resizeMode: "contain",
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
  planOptionButton: {
    alignItems: "center",
    gap: Gap.gap_4,
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
  planOptionLabel: {
    fontFamily: FontFamily.dMSansBold,
  },
  optionLabelActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
  planOptionMeta: {
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
  feedbackBanner: {
    borderRadius: Border.br_12,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
  },
  feedbackText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
});
