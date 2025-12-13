import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
import { createPost, likePost, listPosts, unlikePost } from "../../services/community";
import { getCurrentUser } from "../../services/users";
import type { MediaAsset, PageResponse, PostResponse, UserProfileResponse } from "../../types/api";

type TabName = "posts" | "communities";

const MAX_MEDIA_ITEMS = 4;

type ComposerMedia = {
	uri: string;
	base64?: string;
};

const extractMediaFromPost = (post: PostResponse): MediaAsset[] => {
	const normalizedMedia = (post.media ?? []).filter((item) => item.imageUrl || item.imageBase64);
	return [...normalizedMedia].sort((first, second) => first.position - second.position);
};

const formatDateLabel = (value?: string) => {
	if (!value) {
		return "Agora";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}
	const supportsRelativeTime = typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
	if (supportsRelativeTime) {
		const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
		const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
		if (Math.abs(diffMinutes) < 60) {
			return relativeFormatter.format(diffMinutes, "minute");
		}
		const diffHours = Math.round(diffMinutes / 60);
		if (Math.abs(diffHours) < 24) {
			return relativeFormatter.format(diffHours, "hour");
		}
		const diffDays = Math.round(diffHours / 24);
		return relativeFormatter.format(diffDays, "day");
	}
	const dateLabel = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
	const timeLabel = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
	return `${dateLabel} • ${timeLabel}`;
};

export default function CommunityScreen() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabName>("posts");
	const [postsPage, setPostsPage] = useState<PageResponse<PostResponse> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPickingMedia, setIsPickingMedia] = useState(false);
	const [postContent, setPostContent] = useState("");
	const [selectedMedia, setSelectedMedia] = useState<ComposerMedia[]>([]);
	const [currentUser, setCurrentUser] = useState<UserProfileResponse | null>(null);
	const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const fetchCommunityData = useCallback(
		async (options?: { silent?: boolean }) => {
			setErrorMessage(null);
			if (options?.silent) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}

			try {
				const [pageResponse, profile] = await Promise.all([
					listPosts({ page: 0, size: 10 }),
					getCurrentUser(),
				]);
				setPostsPage(pageResponse);
				setCurrentUser(profile);
				setLikedPostIds((prev) =>
					prev.filter((id) => pageResponse.content?.some((post) => post.id === id) ?? false),
				);
			} catch (error) {
				console.error("Failed to load community data", error);
				setErrorMessage("Nao foi possivel carregar a comunidade agora.");
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[],
	);

	useFocusEffect(
		useCallback(() => {
			fetchCommunityData();
		}, [fetchCommunityData]),
	);

	const handleRefresh = useCallback(() => fetchCommunityData({ silent: true }), [fetchCommunityData]);

	const posts = postsPage?.content ?? [];
	const myPosts = useMemo(() => {
		if (!currentUser) {
			return [];
		}
		return posts.filter((post) => post.authorId === currentUser.id);
	}, [posts, currentUser?.id]);
	const displayedPosts = activeTab === "posts" ? myPosts : posts;
	const sectionCopy = activeTab === "posts"
		? { title: "Meus posts recentes", subtitle: "Gerencie suas publicacoes" }
		: { title: "Publicacoes da comunidade", subtitle: "Veja o que os membros estao compartilhando" };
	const emptyCopy = activeTab === "posts"
		? {
			title: "Voce ainda nao publicou",
			subtitle: "Compartilhe algo novo para iniciar a conversa.",
		}
		: {
			title: "Ainda sem posts da comunidade",
			subtitle: "Volte mais tarde ou atualize para ver novidades.",
		};
	const canCompose = activeTab === "posts";
	const avatarInitials = currentUser?.name
		?.split(" ")
		.filter(Boolean)
		.map((segment) => segment[0]?.toUpperCase())
		.slice(0, 2)
		.join("") ?? "CQ";
	const canAddMedia = selectedMedia.length < MAX_MEDIA_ITEMS;

	const handleSelectMedia = useCallback(async () => {
		if (!canAddMedia || isPickingMedia) {
			return;
		}
		setIsPickingMedia(true);
		setErrorMessage(null);
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				setErrorMessage("Autorize o acesso a galeria para anexar imagens.");
				return;
			}
			const remainingSlots = Math.max(0, MAX_MEDIA_ITEMS - selectedMedia.length) || 1;
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
			setSelectedMedia((prev) => {
				const appended = assets.map((asset) => ({
					uri: asset.uri,
					base64: asset.base64 ?? undefined,
				}));
				const merged = [...prev, ...appended];
				return merged.slice(0, MAX_MEDIA_ITEMS);
			});
		} catch (error) {
			console.error("Failed to pick media", error);
			setErrorMessage("Nao foi possivel acessar sua galeria agora.");
		} finally {
			setIsPickingMedia(false);
		}
	}, [canAddMedia, isPickingMedia, selectedMedia.length]);

	const handleRemoveMedia = useCallback((uri: string) => {
		setSelectedMedia((prev) => prev.filter((item) => item.uri !== uri));
	}, []);

	const handlePublish = useCallback(async () => {
		if (!postContent.trim()) {
			return;
		}
		setIsSubmitting(true);
		setErrorMessage(null);
		try {
			const mediaPayload = selectedMedia.map((item, index) => ({
				position: index + 1,
				imageBase64: item.base64,
				imageUrl:
					item.base64 || !item.uri || item.uri.startsWith("file://") ? undefined : item.uri,
			}));
			await createPost({
				title: "Compartilhamento rapido",
				content: postContent.trim(),
				media: mediaPayload,
			});
			setPostContent("");
			setSelectedMedia([]);
			await fetchCommunityData({ silent: true });
		} catch (error) {
			console.error("Failed to publish post", error);
			setErrorMessage("Nao foi possivel publicar agora. Tente novamente.");
		} finally {
			setIsSubmitting(false);
		}
	}, [fetchCommunityData, postContent, selectedMedia]);

	const handleToggleLike = useCallback(
		async (postId: number) => {
			const isLiked = likedPostIds.includes(postId);
			setErrorMessage(null);
			try {
				if (isLiked) {
					await unlikePost(postId);
					setLikedPostIds((prev) => prev.filter((id) => id !== postId));
					setPostsPage((prev) => {
						if (!prev) {
							return prev;
						}
						const updated = prev.content.map((post) =>
							post.id === postId
								? { ...post, likeCount: Math.max(0, (post.likeCount ?? 0) - 1) }
								: post,
						);
						return { ...prev, content: updated };
					});
				} else {
					await likePost(postId);
					setLikedPostIds((prev) => [...prev, postId]);
					setPostsPage((prev) => {
						if (!prev) {
							return prev;
						}
						const updated = prev.content.map((post) =>
							post.id === postId
								? { ...post, likeCount: (post.likeCount ?? 0) + 1 }
								: post,
						);
						return { ...prev, content: updated };
					});
				}
			} catch (error) {
				console.error("Failed to toggle like", error);
				setErrorMessage("Nao foi possivel atualizar a curtida. Tente novamente.");
			}
		},
		[likedPostIds],
	);

	const handleSharePost = useCallback(async (post: PostResponse) => {
		try {
			await Share.share({
				message: `${post.content}\n\nCompartilhado via Clube Quinze.`,
			});
		} catch (error) {
			console.error("Failed to share post", error);
		}
	}, []);

	const handleOpenComments = useCallback(
		(postId: number, isLiked: boolean) => {
			router.push({ pathname: "/community/[postId]", params: { postId: String(postId), liked: isLiked ? "1" : "0" } });
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
						<Ionicons name="people-outline" size={24} color={Color.piccolo} />
					</View>
					<View style={styles.headerTexts}>
						<Text style={styles.title}>Comunidade Quinze</Text>
						<Text style={styles.subtitle}>
							Aprenda, compartilhe e interaja com outros membros do clube.
						</Text>
					</View>
				</View>

				<View style={styles.segmentedControl}>
					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "posts" && styles.segmentButtonActive]}
						activeOpacity={0.85}
						onPress={() => setActiveTab("posts")}
					>
						<Text style={[styles.segmentLabel, activeTab === "posts" && styles.segmentLabelActive]}>
							Meus posts
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.segmentButton, activeTab === "communities" && styles.segmentButtonActive]}
						activeOpacity={0.85}
						onPress={() => setActiveTab("communities")}
					>
						<Text
							style={[styles.segmentLabel, activeTab === "communities" && styles.segmentLabelActive]}
						>
							Minha comunidade
						</Text>
					</TouchableOpacity>
				</View>

				{canCompose ? (
					<View style={styles.composeCard}>
						<View style={styles.composeHeader}>
							<View style={styles.avatar}>
								<Text style={styles.avatarLabel}>{avatarInitials}</Text>
							</View>
							<View style={styles.composeTexts}>
								<Text style={styles.composeTitle}>Escreva algo para a comunidade</Text>
								<Text style={styles.composeSubtitle}>
									Compartilhe novidades, conquistas ou duvidas.
								</Text>
							</View>
						</View>
						<TextInput
							style={styles.composeInput}
							value={postContent}
							onChangeText={setPostContent}
							placeholder="Escreva uma mensagem para os membros"
							placeholderTextColor={Color.mainTrunks}
							multiline
							textAlignVertical="top"
						/>
						{selectedMedia.length > 0 ? (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.selectedMediaList}
							>
								{selectedMedia.map((item) => {
									const previewUri = item.base64
										? `data:image/jpeg;base64,${item.base64}`
										: item.uri;
									return (
										<View key={item.uri} style={styles.selectedMediaItem}>
											<Image source={{ uri: previewUri }} style={styles.selectedMediaImage} contentFit="cover" />
											<TouchableOpacity
												style={styles.removeMediaButton}
												onPress={() => handleRemoveMedia(item.uri)}
												accessibilityLabel="Remover midia selecionada"
											>
												<Ionicons name="close" size={12} color={Color.mainGoten} />
											</TouchableOpacity>
										</View>
									);
								})}
							</ScrollView>
						) : null}
						<View style={styles.composeActions}>
							<TouchableOpacity
								style={[styles.mediaButton, (!canAddMedia || isPickingMedia) && styles.mediaButtonDisabled]}
								activeOpacity={0.85}
								onPress={handleSelectMedia}
								disabled={!canAddMedia || isPickingMedia}
							>
								{isPickingMedia ? (
									<ActivityIndicator size="small" color={Color.piccolo} />
								) : (
									<Ionicons name="image-outline" size={16} color={Color.piccolo} />
								)}
								<Text style={styles.mediaButtonLabel}>
									{canAddMedia
										? `Adicionar midia (${selectedMedia.length}/${MAX_MEDIA_ITEMS})`
										: `Limite de ${MAX_MEDIA_ITEMS} imagens`}
								</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							style={[styles.publishButton, (!postContent.trim() || isSubmitting) && styles.publishButtonDisabled]}
							activeOpacity={0.85}
							onPress={handlePublish}
							disabled={!postContent.trim() || isSubmitting}
						>
							{isSubmitting ? (
								<ActivityIndicator size="small" color={Color.mainGoten} />
							) : (
								<>
									<Ionicons name="send" size={16} color={Color.mainGoten} />
									<Text style={styles.publishButtonText}>Publicar</Text>
								</>
							)}
						</TouchableOpacity>
					</View>
				) : null}

				{errorMessage ? (
					<View style={styles.errorBanner}>
						<Ionicons name="warning-outline" size={18} color={Color.supportiveRoshi} />
						<Text style={styles.errorText}>{errorMessage}</Text>
					</View>
				) : null}

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>{sectionCopy.title}</Text>
					<Text style={styles.sectionSubtitle}>{sectionCopy.subtitle}</Text>
				</View>

				{isLoading ? (
					<View style={styles.loader}>
						<ActivityIndicator size="small" color={Color.piccolo} />
					</View>
				) : displayedPosts.length === 0 ? (
					<View style={styles.emptyState}>
						<Ionicons
							name={activeTab === "posts" ? "chatbubble-ellipses-outline" : "people-outline"}
							size={28}
							color={Color.mainTrunks}
						/>
						<Text style={styles.emptyStateTitle}>{emptyCopy.title}</Text>
						<Text style={styles.emptyStateSubtitle}>{emptyCopy.subtitle}</Text>
					</View>
				) : (
					displayedPosts.map((post) => {
						const isLiked = likedPostIds.includes(post.id);
						const mediaItems = extractMediaFromPost(post);
						return (
							<View key={post.id} style={styles.postCard}>
								<View style={styles.postHeader}>
									<View style={styles.avatarSmall}>
										<Ionicons name="person" size={16} color={Color.mainGoten} />
									</View>
									<View style={styles.postHeaderTexts}>
										<Text style={styles.postAuthor}>Autor #{post.authorId}</Text>
										<Text style={styles.postTimestamp}>{formatDateLabel(post.createdAt)}</Text>
									</View>
									<TouchableOpacity style={styles.moreButton}>
										<Ionicons name="ellipsis-horizontal" size={18} color={Color.mainTrunks} />
									</TouchableOpacity>
								</View>
								<Text style={styles.postContent}>{post.content}</Text>
								{mediaItems.length > 0 ? (
									<ScrollView
										horizontal
										nestedScrollEnabled
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={styles.postMediaList}
									>
										{mediaItems.map((media) => {
											const mediaUri = media.imageBase64
												? `data:image/jpeg;base64,${media.imageBase64}`
												: media.imageUrl;
											if (!mediaUri) {
												return null;
											}
											return (
												<View
													key={`${post.id}-${media.position}-${mediaUri}`}
													style={styles.postMediaItem}
												>
													<Image source={{ uri: mediaUri }} style={styles.postMediaImage} contentFit="cover" />
												</View>
											);
										})}
									</ScrollView>
								) : null}
								<View style={styles.postActions}>
									<TouchableOpacity
										style={styles.postActionItem}
										activeOpacity={0.85}
										onPress={() => handleToggleLike(post.id)}
									>
										<Ionicons
											name={isLiked ? "heart" : "heart-outline"}
											size={18}
											color={isLiked ? Color.supportiveRoshi : Color.piccolo}
										/>
										<Text style={[styles.postActionLabel, isLiked && styles.postActionLabelHighlighted]}>
											{post.likeCount}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.postActionItem}
										activeOpacity={0.85}
										onPress={() => handleOpenComments(post.id, isLiked)}
									>
										<Ionicons name="chatbubble-ellipses-outline" size={18} color={Color.piccolo} />
										<Text style={styles.postActionLabel}>{post.comments.length}</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.postShare}
										activeOpacity={0.85}
										onPress={() => handleSharePost(post)}
									>
										<Ionicons name="share-outline" size={18} color={Color.piccolo} />
										<Text style={styles.postShareLabel}>Compartilhar</Text>
									</TouchableOpacity>
								</View>
							</View>
						);
					})
				)}
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
	},
	segmentLabel: {
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainTrunks,
	},
	segmentLabelActive: {
		color: Color.hit,
	},
	composeCard: {
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
	composeHeader: {
		flexDirection: "row",
		gap: Gap.gap_8,
		alignItems: "center",
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: Border.br_58,
		backgroundColor: Color.piccolo,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarLabel: {
		fontSize: FontSize.fs_16,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainGoten,
	},
	composeTexts: {
		flex: 1,
		gap: Gap.gap_4,
	},
	composeInput: {
		borderRadius: Border.br_16,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
		padding: StyleVariable.px4,
		minHeight: 90,
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.hit,
	},
	selectedMediaList: {
		gap: StyleVariable.px3,
		paddingVertical: StyleVariable.py2,
	},
	selectedMediaItem: {
		position: "relative",
		width: 96,
		height: 96,
		borderRadius: Border.br_16,
		overflow: "hidden",
	},
	selectedMediaImage: {
		width: "100%",
		height: "100%",
	},
	removeMediaButton: {
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
	composeActions: {
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	mediaButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
		paddingVertical: StyleVariable.py2,
		paddingHorizontal: StyleVariable.px4,
		borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.12)",
		backgroundColor: Color.mainGohan,
	},
	mediaButtonDisabled: {
		opacity: 0.6,
	},
	mediaButtonLabel: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.piccolo,
	},
	composeTitle: {
		fontSize: FontSize.fs_14,
		lineHeight: LineHeight.lh_24,
		fontFamily: FontFamily.dMSansBold,
		color: Color.hit,
	},
	composeSubtitle: {
		fontSize: FontSize.fs_12,
		lineHeight: LineHeight.lh_16,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.mainTrunks,
	},
	publishButton: {
		alignSelf: "flex-end",
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
		backgroundColor: Color.piccolo,
		paddingVertical: StyleVariable.py2,
		paddingHorizontal: StyleVariable.px4,
		borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
	},
	publishButtonDisabled: {
		opacity: 0.6,
	},
	publishButtonText: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainGoten,
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
	postCard: {
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
	postHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
	},
	avatarSmall: {
		width: 40,
		height: 40,
		borderRadius: Border.br_58,
		backgroundColor: Color.piccolo,
		alignItems: "center",
		justifyContent: "center",
	},
	postHeaderTexts: {
		flex: 1,
		gap: Gap.gap_4,
	},
	postAuthor: {
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansBold,
		color: Color.hit,
	},
	postTimestamp: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.mainTrunks,
	},
	moreButton: {
		padding: StyleVariable.px2,
	},
	postContent: {
		fontSize: FontSize.fs_14,
		lineHeight: LineHeight.lh_24,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.hit,
	},
	postMediaList: {
		flexDirection: "row",
		gap: StyleVariable.px3,
	},
	postMediaItem: {
		borderRadius: Border.br_16,
		overflow: "hidden",
		width: 224,
		height: 160,
		backgroundColor: Color.mainGoku,
	},
	postMediaImage: {
		width: "100%",
		height: "100%",
	},
	postActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_16,
	},
	postActionItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_4,
	},
	postActionLabel: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.hit,
	},
	postActionLabelHighlighted: {
		color: Color.supportiveRoshi,
	},
	postShare: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_4,
		marginLeft: "auto",
	},
	postShareLabel: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.piccolo,
	},
	loader: {
		paddingVertical: StyleVariable.py4,
		alignItems: "center",
	},
	emptyState: {
		borderRadius: Border.br_16,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
		paddingVertical: StyleVariable.py4,
		paddingHorizontal: StyleVariable.px4,
		alignItems: "center",
		gap: Gap.gap_8,
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
	errorBanner: {
		marginTop: Gap.gap_8,
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
		padding: StyleVariable.px4,
		borderRadius: Border.br_16,
		backgroundColor: "rgba(255, 87, 34, 0.1)",
		borderWidth: 1,
		borderColor: Color.supportiveRoshi,
	},
	errorText: {
		flex: 1,
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.supportiveRoshi,
	},
	communityCard: {
		borderRadius: Border.br_16,
		backgroundColor: Color.mainGohan,
		padding: StyleVariable.px6,
		gap: Gap.gap_16,
		borderWidth: 1,
		borderColor: "rgba(0, 5, 61, 0.08)",
	},
	communityHeader: {
		flexDirection: "row",
		gap: Gap.gap_8,
		alignItems: "center",
	},
	communityTexts: {
		flex: 1,
		gap: Gap.gap_4,
	},
	communityName: {
		fontSize: FontSize.fs_14,
		lineHeight: LineHeight.lh_24,
		fontFamily: FontFamily.dMSansBold,
		color: Color.hit,
	},
	communityDescription: {
		fontSize: FontSize.fs_12,
		lineHeight: LineHeight.lh_16,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.mainTrunks,
	},
	communityMeta: {
		flexDirection: "row",
		gap: Gap.gap_16,
	},
	communityMetaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Gap.gap_8,
	},
	communityMetaLabel: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansRegular,
		color: Color.hit,
	},
	communityAlertLabel: {
		fontSize: FontSize.fs_12,
		fontFamily: FontFamily.dMSansBold,
		color: Color.supportiveChichi,
	},
	communityButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Gap.gap_8,
		paddingVertical: StyleVariable.py2,
		paddingHorizontal: StyleVariable.px4,
		borderRadius: Border.br_16,
		backgroundColor: Color.piccolo,
	},
	communityButtonText: {
		fontSize: FontSize.fs_14,
		fontFamily: FontFamily.dMSansBold,
		color: Color.mainGoten,
	},
});

