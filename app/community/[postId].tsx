import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
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
  Gap,
  LineHeight,
  Padding,
  StyleVariable,
} from "../../GlobalStyles";
import {
  addComment,
  getPost,
  likePost,
  unlikePost,
} from "../../services/community";
import { getUserById } from "../../services/users";
import type {
  MediaAsset,
  PostResponse,
  UserProfileResponse,
} from "../../types/api";

type RouteParams = {
  postId?: string;
  liked?: string;
};

const formatDateLabel = (value?: string) => {
  if (!value) {
    return "Agora";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const supportsRelativeTime =
    typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
  if (supportsRelativeTime) {
    const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", {
      numeric: "auto",
    });
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
  const dateLabel = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateLabel} • ${timeLabel}`;
};

const extractMediaFromPost = (post: PostResponse | null): MediaAsset[] => {
  if (!post) {
    return [];
  }
  const normalized = (post.media ?? []).filter(
    (item) => item.imageUrl || item.imageBase64,
  );
  return [...normalized].sort(
    (first, second) => first.position - second.position,
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CommunityPostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId, liked: likedParam } = useLocalSearchParams<RouteParams>();
  const numericPostId = Number(postId);
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(likedParam === "1");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [authorProfile, setAuthorProfile] = useState<{
    name: string;
    avatarUri?: string;
    initials: string;
  } | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<
    Record<number, { name: string; avatarUri?: string; initials: string }>
  >({});

  const buildAuthorInitials = useCallback((name?: string) => {
    return (
      name
        ?.split(" ")
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase())
        .slice(0, 2)
        .join("") ?? "CQ"
    );
  }, []);

  const buildProfileAvatarUri = useCallback(
    (profile?: UserProfileResponse | null) => {
      if (!profile) {
        return undefined;
      }
      if (profile.profilePictureBase64) {
        return `data:image/jpeg;base64,${profile.profilePictureBase64}`;
      }
      return profile.profilePictureUrl ?? undefined;
    },
    [],
  );

  const resolveAuthorProfile = useCallback(
    async (authorId?: number) => {
      if (!authorId) {
        setAuthorProfile(null);
        return;
      }
      try {
        const user = await getUserById(authorId);
        if (!user?.name) {
          setAuthorProfile(null);
          return;
        }
        setAuthorProfile({
          name: user.name,
          avatarUri: buildProfileAvatarUri(user),
          initials: buildAuthorInitials(user.name),
        });
      } catch (error) {
        console.error("Failed to resolve author profile", error);
        setAuthorProfile(null);
      }
    },
    [buildAuthorInitials, buildProfileAvatarUri],
  );

  const ensureCommentAuthors = useCallback(
    async (comments: PostResponse["comments"]) => {
      const uniqueAuthorIds = Array.from(
        new Set(
          comments
            .map((comment) => comment.authorId)
            .filter((id): id is number => typeof id === "number" && id > 0),
        ),
      );
      const missingIds = uniqueAuthorIds.filter((id) => !commentAuthors[id]);
      if (!missingIds.length) {
        return;
      }
      try {
        const responses = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const user = await getUserById(id);
              return user?.name
                ? {
                    id,
                    name: user.name,
                    avatarUri: buildProfileAvatarUri(user),
                    initials: buildAuthorInitials(user.name),
                  }
                : null;
            } catch (innerError) {
              console.error("Failed to fetch comment author", id, innerError);
              return null;
            }
          }),
        );
        const newAuthors = responses.reduce<
          Record<number, { name: string; avatarUri?: string; initials: string }>
        >((acc, entry) => {
          if (entry?.name) {
            acc[entry.id] = {
              name: entry.name,
              avatarUri: entry.avatarUri,
              initials: entry.initials,
            };
          }
          return acc;
        }, {});
        if (Object.keys(newAuthors).length) {
          setCommentAuthors((prev) => ({ ...prev, ...newAuthors }));
        }
      } catch (error) {
        console.error("Failed to resolve comment authors", error);
      }
    },
    [buildAuthorInitials, buildProfileAvatarUri, commentAuthors],
  );

  const loadPost = useCallback(async () => {
    if (Number.isNaN(numericPostId)) {
      setErrorMessage("Não foi possível identificar a publicacao.");
      setIsLoading(false);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await getPost(numericPostId);
      setPost(response);
      if (typeof response.authorId === "number") {
        void resolveAuthorProfile(response.authorId);
      } else {
        setAuthorProfile(null);
      }
      const likedByUser =
        (response as { liked?: boolean; likedByMe?: boolean }).liked ??
        (response as { liked?: boolean; likedByMe?: boolean }).likedByMe;
      if (typeof likedByUser === "boolean") {
        setHasLiked(likedByUser);
      }
    } catch (error) {
      console.error("Failed to load post", error);
      setErrorMessage("Não foi possível carregar a publicacao.");
    } finally {
      setIsLoading(false);
    }
  }, [numericPostId, resolveAuthorProfile]);

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [loadPost]),
  );

  useEffect(() => {
    if (post?.comments?.length) {
      void ensureCommentAuthors(post.comments);
    }
  }, [ensureCommentAuthors, post?.comments]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleLike = useCallback(async () => {
    if (!post || Number.isNaN(numericPostId)) {
      return;
    }
    if (isProcessingLike) {
      return;
    }

    setIsProcessingLike(true);
    setErrorMessage(null);
    try {
      if (hasLiked) {
        await unlikePost(post.id);
        setHasLiked(false);
        setPost((prev) =>
          prev
            ? { ...prev, likeCount: Math.max(0, (prev.likeCount ?? 0) - 1) }
            : prev,
        );
      } else {
        await likePost(post.id);
        setHasLiked(true);
        setPost((prev) =>
          prev ? { ...prev, likeCount: (prev.likeCount ?? 0) + 1 } : prev,
        );
      }
    } catch (error) {
      console.error("Failed to toggle like on detail", error);
      setErrorMessage("Não foi possível atualizar a curtida.");
    } finally {
      setIsProcessingLike(false);
    }
  }, [hasLiked, isProcessingLike, numericPostId, post]);

  const handleShare = useCallback(async () => {
    if (!post) {
      return;
    }
    try {
      await Share.share({
        message: `${post.content}\n\nCompartilhado via Clube Quinze.`,
      });
    } catch (error) {
      console.error("Failed to share post", error);
    }
  }, [post]);

  const handleSubmitComment = useCallback(async () => {
    if (!post || !commentContent.trim()) {
      return;
    }
    setIsSubmittingComment(true);
    setErrorMessage(null);
    try {
      const comment = await addComment(post.id, {
        content: commentContent.trim(),
      });
      setPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev,
      );
      setCommentContent("");
    } catch (error) {
      console.error("Failed to submit comment", error);
      setErrorMessage("Não foi possível enviar seu comentario.");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentContent, post]);

  const isInvalidPost = Number.isNaN(numericPostId);
  const isCommentDisabled =
    commentContent.trim().length === 0 || isSubmittingComment;
  const mediaItems = extractMediaFromPost(post);
  const mediaSlides = useMemo(
    () =>
      mediaItems
        .map((media) => {
          const uri = media.imageBase64
            ? `data:image/jpeg;base64,${media.imageBase64}`
            : media.imageUrl;
          if (!uri) {
            return null;
          }
          return {
            key: String(media.position),
            uri,
          } as const;
        })
        .filter(Boolean) as Array<{ key: string; uri: string }>,
    [mediaItems],
  );

  const handleOpenViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setIsViewerOpen(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
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
            <Text style={styles.headerTitle}>Publicacao</Text>
            <TouchableOpacity
              style={styles.headerShare}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar publicacao"
            >
              <Ionicons name="share-outline" size={20} color={Color.piccolo} />
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons
                name="warning-outline"
                size={18}
                color={Color.supportiveRoshi}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={Color.piccolo} />
            </View>
          ) : isInvalidPost || !post ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={Color.mainTrunks}
              />
              <Text style={styles.emptyTitle}>Publicacao não encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Tente voltar e selecionar outra publicacao da comunidade.
              </Text>
            </View>
          ) : (
            <View style={styles.postWrapper}>
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarSmall}>
                    {authorProfile?.avatarUri ? (
                      <Image
                        source={{ uri: authorProfile.avatarUri }}
                        style={styles.avatarImage}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.avatarInitials}>
                        {authorProfile?.initials ?? "CQ"}
                      </Text>
                    )}
                  </View>
                  <View style={styles.postHeaderTexts}>
                    <Text style={styles.postAuthor}>
                      {authorProfile?.name ?? `Autor #${post.authorId}`}
                    </Text>
                    <Text style={styles.postTimestamp}>
                      {formatDateLabel(post.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.likeButton}
                    onPress={handleToggleLike}
                    accessibilityRole="button"
                    accessibilityLabel="Curtir publicacao"
                  >
                    <Ionicons
                      name={hasLiked ? "heart" : "heart-outline"}
                      size={20}
                      color={hasLiked ? Color.supportiveChichi : Color.piccolo}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {mediaSlides.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerStyle={styles.postMediaCarousel}
                  >
                    {mediaSlides.map((media, index) => (
                      <TouchableOpacity
                        key={`${media.key}-${media.uri}`}
                        style={styles.postMediaItem}
                        activeOpacity={0.85}
                        onPress={() => handleOpenViewer(index)}
                      >
                        <Image
                          source={{ uri: media.uri }}
                          style={styles.postMediaImage}
                          cachePolicy="memory-disk"
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : null}

                <View style={styles.postMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="heart"
                      size={16}
                      color={Color.supportiveChichi}
                    />
                    <Text style={styles.metaLabel}>{post.likeCount}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={16}
                      color={Color.piccolo}
                    />
                    <Text style={styles.metaLabel}>{post.comments.length}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Comentarios</Text>
                <Text style={styles.commentsCount}>{post.comments.length}</Text>
              </View>

              {post.comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={Color.mainTrunks}
                  />
                  <Text style={styles.emptyCommentsText}>
                    Seja o primeiro a comentar.
                  </Text>
                </View>
              ) : (
                post.comments.map((comment) => {
                  const commentAuthor =
                    typeof comment.authorId === "number"
                      ? commentAuthors[comment.authorId]
                      : undefined;
                  return (
                    <View key={comment.id} style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <View style={styles.avatarTiny}>
                          {commentAuthor?.avatarUri ? (
                            <Image
                              source={{ uri: commentAuthor.avatarUri }}
                              style={styles.avatarImageTiny}
                              cachePolicy="memory-disk"
                              contentFit="cover"
                            />
                          ) : (
                            <Text style={styles.avatarInitialsTiny}>
                              {commentAuthor?.initials ?? "CQ"}
                            </Text>
                          )}
                        </View>
                        <View style={styles.commentHeaderTexts}>
                          <Text style={styles.commentAuthor}>
                            {commentAuthor?.name ??
                              `Membro #${comment.authorId}`}
                          </Text>
                          <Text style={styles.commentTimestamp}>
                            {formatDateLabel(comment.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        {!isInvalidPost ? (
          <View style={styles.commentComposer}>
            <TextInput
              style={styles.commentInput}
              value={commentContent}
              onChangeText={setCommentContent}
              placeholder="Escreva um comentario"
              placeholderTextColor={Color.mainTrunks}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.commentButton,
                isCommentDisabled && styles.commentButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={isCommentDisabled}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color={Color.mainGoten} />
              ) : (
                <Ionicons name="send" size={18} color={Color.mainGoten} />
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Modal
        visible={isViewerOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseViewer}
      >
        <View style={styles.viewerBackdrop}>
          <TouchableOpacity
            style={[styles.viewerClose, { top: Math.max(insets.top + 16, 40) }]}
            onPress={handleCloseViewer}
            accessibilityRole="button"
            accessibilityLabel="Fechar imagem"
          >
            <Ionicons name="close" size={22} color={Color.mainGoten} />
          </TouchableOpacity>

          <FlatList
            data={mediaSlides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth,
              );
              setViewerIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <View style={styles.viewerSlide}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.viewerImage}
                  cachePolicy="memory-disk"
                  contentFit="contain"
                />
              </View>
            )}
          />

          <View style={styles.viewerCounter}>
            <Text style={styles.viewerCounterText}>
              {viewerIndex + 1} / {mediaSlides.length}
            </Text>
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
    paddingVertical: Padding.padding_24,
    paddingHorizontal: Padding.padding_24,
    gap: Gap.gap_24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Gap.gap_8,
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
  headerShare: {
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 5, 61, 0.08)",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
    paddingHorizontal: StyleVariable.px4,
    paddingVertical: StyleVariable.py2,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: Color.supportiveRoshi,
    backgroundColor: "rgba(255, 87, 34, 0.1)",
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.supportiveRoshi,
  },
  loader: {
    paddingVertical: Padding.padding_24,
    alignItems: "center",
  },
  emptyState: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px6,
    alignItems: "center",
    gap: Gap.gap_16,
    backgroundColor: Color.mainGohan,
  },
  emptyTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  emptySubtitle: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
    lineHeight: LineHeight.lh_16,
  },
  postWrapper: {
    gap: Gap.gap_24,
  },
  postCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    padding: StyleVariable.px6,
    gap: Gap.gap_16,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
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
  likeButton: {
    padding: StyleVariable.px2,
  },
  postContent: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  postMediaCarousel: {
    flexDirection: "row",
    gap: StyleVariable.px3,
    paddingVertical: StyleVariable.py2,
  },
  postMediaItem: {
    width: 260,
    height: 200,
    borderRadius: Border.br_16,
    overflow: "hidden",
    backgroundColor: Color.mainGoku,
  },
  postMediaImage: {
    width: "100%",
    height: "100%",
  },
  postMeta: {
    flexDirection: "row",
    gap: Gap.gap_16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
  },
  metaLabel: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentsTitle: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  commentsCount: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainTrunks,
  },
  emptyComments: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    paddingVertical: StyleVariable.py4,
    paddingHorizontal: StyleVariable.px4,
    alignItems: "center",
    gap: Gap.gap_8,
    backgroundColor: Color.mainGohan,
  },
  emptyCommentsText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  commentCard: {
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
    padding: StyleVariable.px4,
    gap: Gap.gap_8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_8,
  },
  avatarTiny: {
    width: 32,
    height: 32,
    borderRadius: Border.br_58,
    backgroundColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImageTiny: {
    width: "100%",
    height: "100%",
  },
  avatarInitialsTiny: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
  commentHeaderTexts: {
    flex: 1,
    gap: Gap.gap_4,
  },
  commentAuthor: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  commentTimestamp: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  commentContent: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  commentComposer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Gap.gap_8,
    paddingHorizontal: Padding.padding_24,
    paddingBottom: Padding.padding_24,
    paddingTop: Padding.padding_8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 5, 61, 0.08)",
    backgroundColor: Color.mainGohan,
  },
  commentInput: {
    flex: 1,
    minHeight: 60,
    maxHeight: 140,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.08)",
    padding: StyleVariable.px4,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  commentButton: {
    width: 48,
    height: 48,
    borderRadius: Border.br_58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.piccolo,
  },
  commentButtonDisabled: {
    opacity: 0.6,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
  },
  viewerClose: {
    position: "absolute",
    top: StyleVariable.py4,
    right: StyleVariable.px4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  viewerSlide: {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  viewerImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  viewerCounter: {
    position: "absolute",
    bottom: StyleVariable.py4,
    alignSelf: "center",
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  viewerCounterText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});
