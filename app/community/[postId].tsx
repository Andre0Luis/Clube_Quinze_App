import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
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
import { addComment, getPost, likePost, unlikePost } from "../../services/community";
import type { MediaAsset, PostResponse } from "../../types/api";

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

const extractMediaFromPost = (post: PostResponse | null): MediaAsset[] => {
  if (!post) {
    return [];
  }
  const normalized = (post.media ?? []).filter((item) => item.imageUrl || item.imageBase64);
  return [...normalized].sort((first, second) => first.position - second.position);
};

export default function CommunityPostScreen() {
  const router = useRouter();
  const { postId, liked: likedParam } = useLocalSearchParams<RouteParams>();
  const numericPostId = Number(postId);
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(likedParam === "1");

  const loadPost = useCallback(async () => {
    if (Number.isNaN(numericPostId)) {
      setErrorMessage("Nao foi possivel identificar a publicacao.");
      setIsLoading(false);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await getPost(numericPostId);
      setPost(response);
      const likedByUser = (response as { liked?: boolean; likedByMe?: boolean }).liked ??
        (response as { liked?: boolean; likedByMe?: boolean }).likedByMe;
      if (typeof likedByUser === "boolean") {
        setHasLiked(likedByUser);
      }
    } catch (error) {
      console.error("Failed to load post", error);
      setErrorMessage("Nao foi possivel carregar a publicacao.");
    } finally {
      setIsLoading(false);
    }
  }, [numericPostId]);

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [loadPost]),
  );

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
          prev ? { ...prev, likeCount: Math.max(0, (prev.likeCount ?? 0) - 1) } : prev,
        );
      } else {
        await likePost(post.id);
        setHasLiked(true);
        setPost((prev) => (prev ? { ...prev, likeCount: (prev.likeCount ?? 0) + 1 } : prev));
      }
    } catch (error) {
      console.error("Failed to toggle like on detail", error);
      setErrorMessage("Nao foi possivel atualizar a curtida.");
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
      const comment = await addComment(post.id, { content: commentContent.trim() });
      setPost((prev) => (prev ? { ...prev, comments: [...prev.comments, comment] } : prev));
      setCommentContent("");
    } catch (error) {
      console.error("Failed to submit comment", error);
      setErrorMessage("Nao foi possivel enviar seu comentario.");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentContent, post]);

  const isInvalidPost = Number.isNaN(numericPostId);
  const isCommentDisabled = commentContent.trim().length === 0 || isSubmittingComment;
  const mediaItems = extractMediaFromPost(post);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView contentContainerStyle={styles.content}>
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
              <Ionicons name="warning-outline" size={18} color={Color.supportiveRoshi} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color={Color.piccolo} />
            </View>
          ) : isInvalidPost || !post ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={32} color={Color.mainTrunks} />
              <Text style={styles.emptyTitle}>Publicacao nao encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Tente voltar e selecionar outra publicacao da comunidade.
              </Text>
            </View>
          ) : (
            <View style={styles.postWrapper}>
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatarSmall}>
                    <Ionicons name="person" size={16} color={Color.mainGoten} />
                  </View>
                  <View style={styles.postHeaderTexts}>
                    <Text style={styles.postAuthor}>Autor #{post.authorId}</Text>
                    <Text style={styles.postTimestamp}>{formatDateLabel(post.createdAt)}</Text>
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
                      color={hasLiked ? Color.supportiveRoshi : Color.piccolo}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {mediaItems.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerStyle={styles.postMediaCarousel}
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
                          key={`${media.position}-${mediaUri}`}
                          style={styles.postMediaItem}
                        >
                          <Image source={{ uri: mediaUri }} style={styles.postMediaImage} contentFit="cover" />
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : null}

                <View style={styles.postMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="heart" size={16} color={Color.supportiveRoshi} />
                    <Text style={styles.metaLabel}>{post.likeCount}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={Color.piccolo} />
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
                  <Ionicons name="chatbubble-outline" size={24} color={Color.mainTrunks} />
                  <Text style={styles.emptyCommentsText}>Seja o primeiro a comentar.</Text>
                </View>
              ) : (
                post.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.avatarTiny}>
                        <Ionicons name="person" size={14} color={Color.mainGoten} />
                      </View>
                      <View style={styles.commentHeaderTexts}>
                        <Text style={styles.commentAuthor}>Membro #{comment.authorId}</Text>
                        <Text style={styles.commentTimestamp}>{formatDateLabel(comment.createdAt)}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))
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
              style={[styles.commentButton, isCommentDisabled && styles.commentButtonDisabled]}
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
});
