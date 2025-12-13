import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import { listMyAppointments } from "../../services/appointments";
import type { AppointmentResponse, AppointmentTier } from "../../types/api";

type AppointmentTab = "upcoming" | "history";

const getStatusMeta = (status?: AppointmentResponse["status"]) => {
	switch (status) {
		case "SCHEDULED":
			return { label: "Agendado", background: "#1B9984", text: "#FFFFFF" };
		case "COMPLETED":
			return { label: "Concluido", background: "#4CAF50", text: "#FFFFFF" };
		case "CANCELED":
			return { label: "Cancelado", background: "#D7263D", text: "#FFFFFF" };
		default:
			return { label: status ?? "Status", background: Color.mainBeerus, text: Color.mainBulma };
	}
};

const capitalize = (value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const formatDateLabel = (value?: string) => {
	if (!value) {
		return "-";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
	const dayMonth = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
	return `${capitalize(weekday)} • ${dayMonth}`;
};

const formatTimeLabel = (value?: string) => {
	if (!value) {
		return "-";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formatServiceLabel = (value?: string) => {
	if (!value) {
		return "Servico exclusivo";
	}
	return value
		.split(/[_-]/)
		.filter(Boolean)
		.map((segment) => capitalize(segment))
		.join(" ");
};

const formatTierLabel = (tier?: AppointmentTier) => {
	switch (tier) {
		case "QUINZE_SELECT":
			return "Quinze Select";
		case "CLUB_15":
		default:
			return "Clube 15";
	}
};

export default function ReserveScreen() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
	const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const fetchAppointments = useCallback(
		async (options?: { silent?: boolean }) => {
			if (options?.silent) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}

			try {
				const page = await listMyAppointments({ size: 50, page: 0 });
				setAppointments(page.content ?? []);
			} catch (error) {
				console.error("Failed to load appointments", error);
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[],
	);

	useFocusEffect(
		useCallback(() => {
			fetchAppointments();
		}, [fetchAppointments]),
	);

	const handleRefresh = useCallback(() => fetchAppointments({ silent: true }), [fetchAppointments]);

	const upcomingAppointments = useMemo(() => {
		const now = Date.now();
		return appointments
			.filter((appointment) => {
				if (appointment.status !== "SCHEDULED") {
					return false;
				}
				const scheduledTime = new Date(appointment.scheduledAt).getTime();
				if (Number.isNaN(scheduledTime)) {
					return false;
				}
				return scheduledTime >= now;
			})
			.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
	}, [appointments]);

	const historyAppointments = useMemo(() => {
		const now = Date.now();
		return appointments
			.filter((appointment) => {
				const scheduledTime = new Date(appointment.scheduledAt).getTime();
				const isPast = !Number.isNaN(scheduledTime) ? scheduledTime < now : false;
				return appointment.status !== "SCHEDULED" || isPast;
			})
			.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
	}, [appointments]);

	const sectionCopy = activeTab === "upcoming"
		? { title: "Proximas visitas", subtitle: "Atualizado automaticamente" }
		: { title: "Historico recente", subtitle: "Consulte atendimentos concluidos" };

	const appointmentsToRender = activeTab === "upcoming" ? upcomingAppointments : historyAppointments;

	const handleViewDetails = useCallback(
		(appointmentId: number) => {
			router.push({ pathname: "/appointments/[appointmentId]", params: { appointmentId: String(appointmentId) } });
		},
		[router],
	);

	return (
		<SafeAreaView style={styles.safeArea}>
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
					<View style={styles.headerIconWrapper}>
						<Ionicons name="calendar-outline" size={24} color={Color.piccolo} />
					</View>
					<View style={styles.headerTexts}>
						<Text style={styles.title}>Meus agendamentos</Text>
						<Text style={styles.subtitle}>
							Acompanhe e organize seus proximos horarios no Clube Quinze.
						</Text>
					</View>
				</View>

				<View style={styles.segmentedControl}>
					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "upcoming" && styles.segmentButtonActive]}
						activeOpacity={0.85}
						onPress={() => setActiveTab("upcoming")}
					>
						<Text style={[styles.segmentLabel, activeTab === "upcoming" && styles.segmentLabelActive]}>Proximos</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "history" && styles.segmentButtonActive]}
						activeOpacity={0.85}
						onPress={() => setActiveTab("history")}
					>
						<Text style={[styles.segmentLabel, activeTab === "history" && styles.segmentLabelActive]}>Historico</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>{sectionCopy.title}</Text>
					<Text style={styles.sectionSubtitle}>{sectionCopy.subtitle}</Text>
				</View>

				{isLoading ? (
					<View style={styles.loaderWrapper}>
						<ActivityIndicator size="small" color={Color.piccolo} />
					</View>
				) : appointmentsToRender.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name={activeTab === "upcoming" ? "calendar-clear-outline" : "time-outline"}
							size={32}
							color={Color.mainTrunks}
						/>
						<Text style={styles.emptyStateTitle}>
							{activeTab === "upcoming" ? "Nenhum horario futuro" : "Historico ainda vazio"}
						</Text>
						<Text style={styles.emptyStateSubtitle}>
							{activeTab === "upcoming"
								? "Agende um novo horario para ver seus proximos atendimentos."
								: "Seus atendimentos concluidos aparecerão aqui automaticamente."}
						</Text>
					</View>
				) : (
					appointmentsToRender.map((appointment) => {
						const statusMeta = getStatusMeta(appointment.status);
						return (
							<View key={appointment.id} style={styles.card}>
								<View style={styles.cardHeader}>
									<View style={styles.cardIconWrapper}>
										<Ionicons
											name={activeTab === "upcoming" ? "time-outline" : "checkmark-done-outline"}
											size={20}
											color={Color.piccolo}
										/>
									</View>
									<View style={styles.cardHeaderTexts}>
										<Text style={styles.cardTitle}>{formatServiceLabel(appointment.serviceType)}</Text>
										<Text style={styles.cardDescription}>{formatTierLabel(appointment.appointmentTier)}</Text>
									</View>
									<View style={[styles.statusBadge, { backgroundColor: statusMeta.background }]}>
										<Text style={[styles.statusText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
									</View>
								</View>

								<View style={styles.cardMeta}>
									<View style={styles.metaItem}>
										<Ionicons name="calendar-clear-outline" size={16} color={Color.piccolo} />
										<Text style={styles.metaText}>{formatDateLabel(appointment.scheduledAt)}</Text>
									</View>
									<View style={styles.metaItem}>
										<Ionicons name="alarm-outline" size={16} color={Color.piccolo} />
										<Text style={styles.metaText}>{formatTimeLabel(appointment.scheduledAt)}</Text>
									</View>
								</View>

								<TouchableOpacity
									style={styles.detailsButton}
									activeOpacity={0.85}
									onPress={() => handleViewDetails(appointment.id)}
								>
									<Text style={styles.detailsButtonText}>Ver detalhes</Text>
									<Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
								</TouchableOpacity>
							</View>
						);
					})
				)}

				<TouchableOpacity
					style={styles.newAppointmentButton}
					activeOpacity={0.9}
					onPress={() => router.push("/schedule")}
				>
					<Ionicons name="add" size={20} color={Color.mainGoten} />
					<Text style={styles.newAppointmentText}>Agendar novo horario</Text>
				</TouchableOpacity>
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
		shadowColor: "rgba(0, 0, 0, 0.05)",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 12,
		elevation: 2,
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
	},
	statusText: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainGohan,
		textTransform: "uppercase",
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
	loaderWrapper: {
		marginTop: Gap.gap_8,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: StyleVariable.py4,
	},
	emptyState: {
		marginTop: Gap.gap_8,
		borderRadius: Border.br_16,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
		paddingVertical: StyleVariable.py4,
		paddingHorizontal: StyleVariable.px6,
		alignItems: "center",
		gap: Gap.gap_16,
		backgroundColor: Color.mainGohan,
	},
	emptyStateTitle: {
		fontSize: FontSize.fs_16,
		fontFamily: FontFamily.dMSansBold,
		color: Color.hit,
	},
	emptyStateSubtitle: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.mainTrunks,
		textAlign: "center",
		lineHeight: LineHeight.lh_16,
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

