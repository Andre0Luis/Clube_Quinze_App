import { Ionicons } from "@expo/vector-icons";
import {
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
} from "../GlobalStyles";

const upcomingAppointments = [
  {
    id: "1",
    title: "Barbearia Quinze - Unidade Paulista",
    description: "Corte completo e tratamento facial",
    date: "Sexta-feira, 17 de junho",
    time: "15:30",
    status: "Agendado",
  },
  {
    id: "2",
    title: "Barbearia Quinze - Unidade Jardins",
    description: "Serviço Premium Quinze Select",
    date: "Sábado, 25 de junho",
    time: "10:00",
    status: "Agendado",
  },
];

const AgendamentoScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="calendar-outline" size={24} color={Color.piccolo} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Meus agendamentos</Text>
            <Text style={styles.subtitle}>
              Acompanhe e organize seus próximos horários no Clube Quinze.
            </Text>
          </View>
        </View>

        <View style={styles.segmentedControl}>
          <TouchableOpacity style={[styles.segmentButton, styles.segmentButtonActive]}>
            <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Próximos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.segmentButton}>
            <Text style={styles.segmentLabel}>Histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximas visitas</Text>
          <Text style={styles.sectionSubtitle}>Atualizado automaticamente</Text>
        </View>

        {upcomingAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrapper}>
                <Ionicons name="time-outline" size={20} color={Color.piccolo} />
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>{appointment.title}</Text>
                <Text style={styles.cardDescription}>{appointment.description}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-clear-outline" size={16} color={Color.piccolo} />
                <Text style={styles.metaText}>{appointment.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="alarm-outline" size={16} color={Color.piccolo} />
                <Text style={styles.metaText}>{appointment.time}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.detailsButton} activeOpacity={0.85}>
              <Text style={styles.detailsButtonText}>Ver detalhes</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.newAppointmentButton} activeOpacity={0.9}>
          <Ionicons name="add" size={20} color={Color.mainGoten} />
          <Text style={styles.newAppointmentText}>Agendar novo horário</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Color.mainGohan,
  },
  content: {
    paddingTop: Padding.padding_32,
    paddingBottom: Padding.padding_32,
    paddingHorizontal: Padding.padding_24,
    gap: Gap.gap_24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Border.br_24,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  title: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  subtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Color.mainGoku,
    padding: StyleVariable.px1,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    gap: StyleVariable.px1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: StyleVariable.py2,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: Color.mainGohan,
  },
  segmentLabel: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  segmentLabelActive: {
    color: Color.hit,
  },
  sectionHeader: {
    gap: Gap.gap_4,
  },
  sectionTitle: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  sectionSubtitle: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  card: {
    borderRadius: Border.br_16,
    backgroundColor: Color.mainGohan,
    padding: StyleVariable.px6,
    gap: Gap.gap_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  gap: Gap.gap_8,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    backgroundColor: "rgba(0, 5, 61, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  cardTitle: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  cardDescription: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  statusBadge: {
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_16,
    backgroundColor: Color.supportiveRoshi,
  },
  statusText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGohan,
  },
  cardMeta: {
    flexDirection: "row",
    gap: Gap.gap_16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  metaText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Gap.gap_4,
  },
  detailsButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
    textDecorationLine: "underline",
  },
  newAppointmentButton: {
    marginTop: Gap.gap_8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Gap.gap_8,
    paddingVertical: StyleVariable.py4,
    borderRadius: Border.br_16,
    backgroundColor: Color.piccolo,
  },
  newAppointmentText: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});

export default AgendamentoScreen;
