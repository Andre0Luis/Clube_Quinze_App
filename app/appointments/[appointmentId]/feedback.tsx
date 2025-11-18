import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
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
    LineHeight,
    Padding,
    StyleVariable,
} from "../../../GlobalStyles";
import { getAppointmentById } from "../../../services/appointments";
import { submitFeedback } from "../../../services/feedback";
import type { AppointmentResponse } from "../../../types/api";

const STAR_VALUES = [1, 2, 3, 4, 5];
const STAR_ACTIVE_COLOR = "#F6B93B";
const STAR_INACTIVE_COLOR = Color.mainBeerus;

const formatDate = (input?: string) => {
  if (!input) {
    return "Sem data";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (input?: string) => {
  if (!input) {
    return "Sem horario";
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AppointmentFeedbackScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const id = Number(appointmentId);
    if (!appointmentId || Number.isNaN(id)) {
      Alert.alert("Agendamento invalido", "Nao conseguimos carregar este atendimento.");
      router.back();
      return;
    }

    let isMounted = true;

    const loadAppointment = async () => {
      setIsLoading(true);
      try {
        const response = await getAppointmentById(id);
        if (!isMounted) {
          return;
        }
        setAppointment(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        Alert.alert(
          "Falha ao carregar",
          "Nao foi possivel carregar os detalhes. Tente novamente mais tarde.",
        );
        router.back();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, router]);

  const canSubmit = useMemo(() => rating !== null && !isSubmitting, [rating, isSubmitting]);

  const handleSubmit = async () => {
    if (!appointment || rating === null) {
      Alert.alert("Selecione uma nota", "Escolha quantas estrelas deseja dar ao atendimento.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback({
        appointmentId: appointment.id,
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      Alert.alert("Obrigado", "Sua avaliacao foi enviada com sucesso.", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Nao foi possivel enviar", "Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={18} color={Color.piccolo} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliar Atendimento</Text>
      </View>

      <Text style={styles.subtitle}>Conte pra gente como foi sua experiencia</Text>

      {isLoading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="small" color={Color.piccolo} />
        </View>
      ) : appointment ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.detailCard}>
              <View style={styles.cardIconWrapper}>
                <Ionicons name="calendar" size={20} color={Color.piccolo} />
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Data</Text>
                <Text style={styles.cardValue}>{formatDate(appointment.scheduledAt)}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Horario</Text>
                <Text style={styles.cardValue}>{formatTime(appointment.scheduledAt)}</Text>
              </View>
            </View>

            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>Como voce avalia este atendimento?</Text>
              <View style={styles.starsRow}>
                {STAR_VALUES.map((value) => {
                  const isActive = rating !== null && value <= rating;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setRating(value)}
                      activeOpacity={0.85}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={isActive ? "star" : "star-outline"}
                        size={36}
                        color={isActive ? STAR_ACTIVE_COLOR : STAR_INACTIVE_COLOR}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.commentBlock}>
              <Text style={styles.commentLabel}>Adicione um comentario (Opcional)</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                style={styles.commentInput}
                placeholder="Compartilhe um pouco da sua experiencia"
                placeholderTextColor={Color.mainBeerus}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={800}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit ? styles.primaryButtonDisabled : null]}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={Color.mainGoten} />
              ) : (
                <Text style={styles.primaryButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.loaderWrapper}>
          <Text style={styles.errorText}>Nao encontramos os dados deste atendimento.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: StyleVariable.gap2,
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.mainGoten,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  subtitle: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py1,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Padding.padding_24,
  },
  errorText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: StyleVariable.py4,
    paddingBottom: 160,
    gap: StyleVariable.py4,
  },
  detailCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py4,
    gap: StyleVariable.gap2,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E7F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  cardValue: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  ratingBlock: {
    gap: StyleVariable.gap2,
  },
  ratingLabel: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  starsRow: {
    flexDirection: "row",
    gap: StyleVariable.gap2,
  },
  starButton: {
    padding: StyleVariable.py1,
  },
  commentBlock: {
    gap: StyleVariable.gap2,
  },
  commentLabel: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainBulma,
  },
  commentInput: {
    minHeight: 136,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainBulma,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Padding.padding_24,
    paddingBottom: Padding.padding_24,
    paddingTop: StyleVariable.py2,
    backgroundColor: Color.mainGohan,
  },
  primaryButton: {
    height: StyleVariable.heightH12,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
