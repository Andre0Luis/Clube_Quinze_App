import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import api from "../../services/api";
import { logout as logoutService } from "../../services/auth";

interface DecodedToken {
	name?: string;
}

interface UserProfile {
	name?: string;
	email?: string;
}

type ProfileOption = {
	id: string;
	title: string;
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
};

const profileOptions: ProfileOption[] = [
	{
		id: "personal-data",
		title: "Dados pessoais",
		description: "Atualize seu nome, telefone e endereco.",
		icon: "id-card-outline",
	},
	{
		id: "preferences",
		title: "Preferencias",
		description: "Gerencie temas, comunicacoes e acessos.",
		icon: "options-outline",
	},
	{
		id: "plans",
		title: "Planos",
		description: "Revise beneficios e historico do seu plano.",
		icon: "card-outline",
	},
	{
		id: "policies",
		title: "Termos e politicas",
		description: "Consulte nossos termos de uso e privacidade.",
		icon: "document-text-outline",
	},
];

export default function ProfileScreen() {
	const router = useRouter();
	const [userName, setUserName] = useState("");
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		let isMounted = true;

		const fetchUserProfile = async () => {
			try {
				const token = await SecureStore.getItemAsync("accessToken");
				if (!token) {
					return;
				}

				const decoded = jwtDecode<DecodedToken>(token);
				if (decoded?.name && isMounted) {
					setUserName(decoded.name);
				}

				const { data } = await api.get<UserProfile>("/users/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!isMounted) {
					return;
				}

				if (data?.name) {
					setUserName(data.name);
				}
			} catch (error) {
				console.warn("Falha ao obter dados do usuario", error);
			}
		};

		fetchUserProfile();

		return () => {
			isMounted = false;
		};
	}, []);

	const displayName = useMemo(() => userName || "Convidado", [userName]);

	const handleOptionPress = useCallback((option: ProfileOption) => {
		Alert.alert(option.title, "Em breve voce podera gerenciar essa secao por aqui.");
	}, []);

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
			router.replace("/login");
		}
	}, [isLoggingOut, router]);

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.content}>
					<View style={styles.headerCard}>
						<View style={styles.headerTexts}>
							<Text style={styles.headerGreeting}>Ola, {displayName}!</Text>
							<Text style={styles.headerSubtitle}>
								Tenha uma experiencia personalizada e mantenha seus dados sempre atualizados.
							</Text>
						</View>
						<View style={styles.headerIcon}>
							<Ionicons name="person-circle-outline" size={48} color={Color.piccolo} />
						</View>
					</View>

					<View style={styles.optionList}>
						{profileOptions.map((option) => (
							<TouchableOpacity
								key={option.id}
								style={styles.optionCard}
								activeOpacity={0.85}
								onPress={() => handleOptionPress(option)}
							>
								<View style={styles.optionIconWrapper}>
									<Ionicons name={option.icon} size={20} color={Color.piccolo} />
								</View>
								<View style={styles.optionTexts}>
									<Text style={styles.optionTitle}>{option.title}</Text>
									<Text style={styles.optionDescription}>{option.description}</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color={Color.mainTrunks} />
							</TouchableOpacity>
						))}
					</View>

					<View style={styles.highlightCard}>
						<View style={styles.highlightBadge}>
							<Text style={styles.highlightBadgeText}>Responsabilidade social</Text>
						</View>
						<Text style={styles.highlightTitle}>Passos Magicos</Text>
						<Text style={styles.highlightDescription}>
							Participe de uma das nossas acoes sociais, compartilhando experiencias com nossos alunos e apoiando novas historias.
						</Text>
						<TouchableOpacity style={styles.highlightLink} activeOpacity={0.8}>
							<Text style={styles.highlightLinkText}>Quero participar</Text>
							<Ionicons name="arrow-forward" size={16} color={Color.piccolo} />
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={styles.logoutButton}
						activeOpacity={0.85}
						onPress={handleLogout}
						disabled={isLoggingOut}
					>
						<Ionicons name="log-out-outline" size={20} color={Color.mainGoten} />
						<Text style={styles.logoutText}>Sair do app</Text>
						{isLoggingOut ? (
							<ActivityIndicator size="small" color={Color.mainGoten} style={styles.logoutSpinner} />
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
	headerIcon: {
		width: 64,
		height: 64,
		borderRadius: Border.br_58,
		backgroundColor: "rgba(0, 5, 61, 0.08)",
		alignItems: "center",
		justifyContent: "center",
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
		gap: Gap.gap_16,
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
	highlightLink: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
	},
	highlightLinkText: {
		fontSize: FontSize.fs_12,
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

