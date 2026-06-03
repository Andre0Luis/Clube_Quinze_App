import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
    createPost,
    deletePost,
    likePost,
    listPosts,
    unlikePost,
} from "../../services/community";
import { compressImageForUpload } from "../../services/image";
import { uploadMedia } from "../../services/media";
import { getCurrentUser, getUserById } from "../../services/users";
import type {
    MediaAsset,
    PageResponse,
    PostResponse,
    UserProfileResponse,
} from "../../types/api";

type TabName = "posts" | "communities";

const MAX_MEDIA_ITEMS = 4;
const IMAGE_MEDIA_TYPE =
  (ImagePicker as any).MediaType?.Images ??
  (ImagePicker as any).MediaTypeOptions?.Images;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type ComposerMedia = {
  uri: string;
  base64?: string;
};

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

const extractMediaFromPost = (post: PostResponse): MediaAsset[] => {
  const normalizedMedia = (post.media ?? []).filter(
    (item) => item.imageUrl || item.imageBase64,
  );
  return [...normalizedMedia].sort(
    (first, second) => first.position - second.position,
  );
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
  return `${dateLabel} - ${timeLabel}`;
};

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authorized, setAuthorized] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("communities");
  const [postsPage, setPostsPage] = useState<PageResponse<PostResponse> | null>(
    null,
  );
  const hasLoadedOnce = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPickingMedia, setIsPickingMedia] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<ComposerMedia[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfileResponse | null>(
    null,
  );
  const [authorProfiles, setAuthorProfiles] = useState<
    Record<number, { name: string; avatarUri?: string; initials: string }>
  >({});
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  const [deletingPostIds, setDeletingPostIds] = useState<number[]>([]);
  const [openMenuPostId, setOpenMenuPostId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerSlides, setViewerSlides] = useState<
    Array<{ key: string; uri: string }>
  >([]);
  const viewerTotal = viewerSlides.length;
  const viewerDisplayIndex =
    viewerTotal > 0 ? Math.min(viewerIndex, viewerTotal - 1) + 1 : 0;

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

  const ensureAuthorProfiles = useCallback(
    async (posts: PostResponse[]) => {
      const uniqueAuthorIds = Array.from(
        new Set(posts.map((post) => post.authorId)),
      ).filter((id): id is number => typeof id === "number" && id > 0);
      const missingIds = uniqueAuthorIds.filter((id) => !authorProfiles[id]);
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
              console.error("Failed to fetch author data", id, innerError);
              return null;
            }
          }),
        );
        const newProfiles = responses.reduce<
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
        if (Object.keys(newProfiles).length) {
          setAuthorProfiles((prev) => ({ ...prev, ...newProfiles }));
        }
      } catch (error) {
        console.error("Failed to resolve author names", error);
      }
    },
    [authorProfiles, buildAuthorInitials, buildProfileAvatarUri],
  );

  const fetchCommunityData = useCallback(
    async (options?: { silent?: boolean }) => {
      setErrorMessage(null);
      // Re-visitas usam refresh silencioso (sem apagar conteúdo existente)
      const isSilent = options?.silent || hasLoadedOnce.current;
      if (isSilent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [pageResponse, profile] = await Promise.all([
          listPosts({ page: 0, size: 10 }),
          getCurrentUser(),
        ]);

        // Auth check inline — redireciona se não autenticado
        if (!profile) {
          setAuthorized(false);
          router.replace("/");
          return;
        }

        hasLoadedOnce.current = true;
        setAuthorized(true);
        setPostsPage(pageResponse);
        setCurrentUser(profile);
        setLikedPostIds((prev) =>
          prev.filter(
            (id) =>
              pageResponse.content?.some((post) => post.id === id) ?? false,
          ),
        );
        void ensureAuthorProfiles(pageResponse.content ?? []);
      } catch (error) {
        console.error("Failed to load community data", error);
        if (!hasLoadedOnce.current) {
          // Falha no primeiro load pode ser auth — redireciona
          setAuthorized(false);
          router.replace("/");
        } else {
          setErrorMessage("Não foi possível carregar a comunidade agora.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ensureAuthorProfiles, router],
  );

  useFocusEffect(
    useCallback(() => {
      fetchCommunityData();
    }, [fetchCommunityData]),
  );

  const handleRefresh = useCallback(
    () => fetchCommunityData({ silent: true }),
    [fetchCommunityData],
  );

  const posts = postsPage?.content ?? [];
  const myPosts = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return posts.filter((post) => post.authorId === currentUser.id);
  }, [posts, currentUser?.id]);
  const displayedPosts = activeTab === "posts" ? myPosts : posts;
  const sectionCopy =
    activeTab === "posts"
      ? { title: "Meus posts recentes", subtitle: "Gerencie suas publicações" }
      : {
          title: "Publicações da comunidade",
          subtitle: "Veja o que os membros estão compartilhando",
        };
  const emptyCopy =
    activeTab === "posts"
      ? {
          title: "Você ainda não publicou",
          subtitle: "Compartilhe algo novo para iniciar a conversa.",
        }
      : {
          title: "Ainda sem posts da comunidade",
          subtitle: "Volte mais tarde ou atualize para ver novidades.",
        };
  const canCompose = activeTab === "posts";
  const avatarInitials =
    currentUser?.name
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
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Autorize o acesso à galeria para anexar imagens.");
        return;
      }
      const remainingSlots =
        Math.max(0, MAX_MEDIA_ITEMS - selectedMedia.length) || 1;
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
      // Comprime/redimensiona antes de anexar para aliviar o upload e o backend.
      const compressed = await Promise.all(
        assets.map(async (asset) => ({
          uri: await compressImageForUpload(asset.uri),
        })),
      );
      setSelectedMedia((prev) => {
        const merged = [...prev, ...compressed];
        return merged.slice(0, MAX_MEDIA_ITEMS);
      });
    } catch (error) {
      console.error("Failed to pick media", error);
      setErrorMessage("Não foi possível acessar sua galeria agora.");
    } finally {
      setIsPickingMedia(false);
    }
  }, [canAddMedia, isPickingMedia, selectedMedia.length]);

  const handleRemoveMedia = useCallback((uri: string) => {
    setSelectedMedia((prev) => prev.filter((item) => item.uri !== uri));
  }, []);

  useEffect(() => {
    if (currentUser?.id && currentUser.name) {
      setAuthorProfiles((prev) => {
        const existing = prev[currentUser.id];
        if (
          existing?.name === currentUser.name &&
          existing?.avatarUri === buildProfileAvatarUri(currentUser)
        ) {
          return prev;
        }
        return {
          ...prev,
          [currentUser.id]: {
            name: currentUser.name,
            avatarUri: buildProfileAvatarUri(currentUser),
            initials: buildAuthorInitials(currentUser.name),
          },
        };
      });
    }
  }, [buildAuthorInitials, buildProfileAvatarUri, currentUser]);

  const handlePublish = useCallback(async () => {
    if (!postContent.trim()) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const uploadedMedia = [] as MediaAsset[];

      for (let index = 0; index < selectedMedia.length; index += 1) {
        const media = selectedMedia[index];
        const file = buildUploadFile(media.uri, index + 1);
        const uploaded = await uploadMedia(file, "posts");
        const imageUrl = uploaded.url ?? uploaded.path;
        uploadedMedia.push({
          position: index + 1,
          imageUrl,
        });
      }

      await createPost({
        title: "Compartilhamento rápido",
        content: postContent.trim(),
        media: uploadedMedia,
      });
      setPostContent("");
      setSelectedMedia([]);
      await fetchCommunityData({ silent: true });
    } catch (error) {
      console.error("Failed to publish post", error);
      const responseStatus =
        typeof error === "object" && error && "response" in error
          ? (error as any).response?.status
          : undefined;
      if (responseStatus === 413) {
        setErrorMessage(
          "Imagem muito grande para upload. Tente uma foto menor ou com menos mídias.",
        );
      } else {
        setErrorMessage("Não foi possível publicar agora. Tente novamente.");
      }
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
        setErrorMessage(
          "Não foi possível atualizar a curtida. Tente novamente.",
        );
      }
    },
    [likedPostIds],
  );

  const handleSharePost = useCallback(async (post: PostResponse) => {
    try {
      const caption = `${post.content}\n\nCompartilhado via Clube Quinze.`;
      const mediaItems = extractMediaFromPost(post);
      const firstImage = mediaItems[0];

      // Sem imagem — compartilha só o texto
      if (!firstImage) {
        await Share.share({ message: caption });
        return;
      }

      const imageUri = firstImage.imageBase64
        ? `data:image/jpeg;base64,${firstImage.imageBase64}`
        : firstImage.imageUrl;

      if (!imageUri) {
        await Share.share({ message: caption });
        return;
      }

      // Se for base64, salva como arquivo temporário
      let localUri: string;
      if (imageUri.startsWith("data:")) {
        const base64Data = imageUri.split(",")[1];
        localUri = `${FileSystem.cacheDirectory}share_${post.id}.jpg`;
        await FileSystem.writeAsStringAsync(localUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // Baixa a imagem remota para um arquivo local
        localUri = `${FileSystem.cacheDirectory}share_${post.id}.jpg`;
        const download = await FileSystem.downloadAsync(imageUri, localUri);
        localUri = download.uri;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // expo-sharing abre o sheet nativo com a imagem;
        // o usuário pode adicionar a legenda antes de enviar no WhatsApp
        await Sharing.shareAsync(localUri, {
          mimeType: "image/jpeg",
          dialogTitle: caption,
          UTI: "public.jpeg",
        });
      } else {
        // Fallback para texto se o sharing nativo não estiver disponível
        await Share.share({ message: caption });
      }
    } catch (error) {
      console.error("Failed to share post", error);
    }
  }, []);

  const handleDeletePost = useCallback(
    (post: PostResponse) => {
      if (!currentUser) {
        return;
      }
      const canDelete =
        currentUser.role === "CLUB_ADMIN" || post.authorId === currentUser.id;
      if (!canDelete) {
        return;
      }

      Alert.alert(
        "Excluir post",
        "Tem certeza que deseja remover este post da comunidade?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              setDeletingPostIds((prev) => [...prev, post.id]);
              try {
                await deletePost(post.id);
                setPostsPage((prev) => {
                  if (!prev) return prev;
                  const updated = prev.content.filter(
                    (item) => item.id !== post.id,
                  );
                  return { ...prev, content: updated };
                });
                setLikedPostIds((prev) => prev.filter((id) => id !== post.id));
              } catch (error) {
                console.error("Failed to delete post", error);
                setErrorMessage("Não foi possível excluir o post agora.");
              } finally {
                setDeletingPostIds((prev) =>
                  prev.filter((id) => id !== post.id),
                );
              }
            },
          },
        ],
        { cancelable: true },
      );
    },
    [currentUser],
  );

  const handlePostOptions = useCallback((post: PostResponse) => {
    setOpenMenuPostId((current) => (current === post.id ? null : post.id));
  }, []);

  const buildMediaSlides = useCallback((items: MediaAsset[]) => {
    return items
      .map((media) => {
        const uri = media.imageBase64
          ? `data:image/jpeg;base64,${media.imageBase64}`
          : media.imageUrl;
        if (!uri) {
          return null;
        }
        return { key: String(media.position), uri } as const;
      })
      .filter(Boolean) as Array<{ key: string; uri: string }>;
  }, []);

  const handleOpenViewer = useCallback(
    (items: MediaAsset[], index: number) => {
      const slides = buildMediaSlides(items);
      if (!slides.length) {
        return;
      }
      const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
      setViewerSlides(slides);
      setViewerIndex(safeIndex);
      setIsViewerOpen(true);
    },
    [buildMediaSlides],
  );

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
  }, []);

  const handleOpenComments = useCallback(
    (postId: number, isLiked: boolean) => {
      router.push({
        pathname: "/community/[postId]",
        params: { postId: String(postId), liked: isLiked ? "1" : "0" },
      });
    },
    [router],
  );

  if (!authorized) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScrollBeginDrag={() => setOpenMenuPostId(null)}
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
            style={[
              styles.segmentButton,
              activeTab === "communities" && styles.segmentButtonActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab("communities")}
          >
            <Text
              style={[
                styles.segmentLabel,
                activeTab === "communities" && styles.segmentLabelActive,
              ]}
            >
              Minha comunidade
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeTab === "posts" && styles.segmentButtonActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setActiveTab("posts")}
          >
            <Text
              style={[
                styles.segmentLabel,
                activeTab === "posts" && styles.segmentLabelActive,
              ]}
            >
              Meus posts
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
                <Text style={styles.composeTitle}>
                  Escreva algo para a comunidade
                </Text>
                <Text style={styles.composeSubtitle}>
                  Compartilhe novidades, conquistas ou dúvidas.
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
                      <Image
                        source={{ uri: previewUri }}
                        style={styles.selectedMediaImage}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => handleRemoveMedia(item.uri)}
                        accessibilityLabel="Remover mídia selecionada"
                      >
                        <Ionicons
                          name="close"
                          size={12}
                          color={Color.mainGoten}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
            <View style={styles.composeActions}>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  (!canAddMedia || isPickingMedia) &&
                    styles.mediaButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleSelectMedia}
                disabled={!canAddMedia || isPickingMedia}
              >
                {isPickingMedia ? (
                  <ActivityIndicator size="small" color={Color.piccolo} />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={16}
                    color={Color.piccolo}
                  />
                )}
                <Text style={styles.mediaButtonLabel}>
                  {canAddMedia
                    ? `Adicionar mídia (${selectedMedia.length}/${MAX_MEDIA_ITEMS})`
                    : `Limite de ${MAX_MEDIA_ITEMS} imagens`}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.publishButton,
                (!postContent.trim() || isSubmitting) &&
                  styles.publishButtonDisabled,
              ]}
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
            <Ionicons
              name="warning-outline"
              size={18}
              color={Color.supportiveRoshi}
            />
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
              name={
                activeTab === "posts"
                  ? "chatbubble-ellipses-outline"
                  : "people-outline"
              }
              size={28}
              color={Color.mainTrunks}
            />
            <Text style={styles.emptyStateTitle}>{emptyCopy.title}</Text>
            <Text style={styles.emptyStateSubtitle}>{emptyCopy.subtitle}</Text>
          </View>
        ) : (
          displayedPosts.map((post) => {
            const isLiked = likedPostIds.includes(post.id);
            const canDelete =
              currentUser?.role === "CLUB_ADMIN" ||
              currentUser?.id === post.authorId;
            const isDeleting = deletingPostIds.includes(post.id);
            const mediaItems = extractMediaFromPost(post);
            const authorProfile =
              typeof post.authorId === "number"
                ? authorProfiles[post.authorId]
                : undefined;
            const authorAvatarUri = authorProfile?.avatarUri;
            const authorInitials = authorProfile?.initials ?? "CQ";
            return (
              <View key={post.id} style={styles.postCard}>
                {openMenuPostId === post.id ? (
                  <Pressable
                    style={styles.postMenuBackdrop}
                    onPress={() => setOpenMenuPostId(null)}
                    accessibilityLabel="Fechar opcoes do post"
                  />
                ) : null}
                <View style={styles.postHeader}>
                  <View style={styles.avatarSmall}>
                    {authorAvatarUri ? (
                      <Image
                        source={{ uri: authorAvatarUri }}
                        style={styles.avatarImage}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.avatarInitials}>
                        {authorInitials}
                      </Text>
                    )}
                  </View>
                  <View style={styles.postHeaderTexts}>
                    <Text style={styles.postAuthor}>
                      {currentUser?.id === post.authorId
                        ? "Você"
                        : (authorProfile?.name ?? `Autor #${post.authorId}`)}
                    </Text>
                    <Text style={styles.postTimestamp}>
                      {formatDateLabel(post.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => {
                      if (isDeleting) return;
                      handlePostOptions(post);
                    }}
                    disabled={isDeleting}
                    activeOpacity={0.85}
                  >
                    {isDeleting ? (
                      <ActivityIndicator
                        size="small"
                        color={Color.mainTrunks}
                      />
                    ) : (
                      <Ionicons
                        name="ellipsis-vertical"
                        size={18}
                        color={Color.mainTrunks}
                      />
                    )}
                  </TouchableOpacity>
                  {openMenuPostId === post.id ? (
                    <View style={styles.postMenu}>
                      <TouchableOpacity
                        style={styles.postMenuItem}
                        onPress={() => {
                          setOpenMenuPostId(null);
                          Alert.alert(
                            "Edicao",
                            "Funcao de editar post ainda Não esta disponivel.",
                          );
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.postMenuText}>Editar</Text>
                      </TouchableOpacity>
                      {canDelete ? (
                        <TouchableOpacity
                          style={styles.postMenuItem}
                          onPress={() => {
                            setOpenMenuPostId(null);
                            handleDeletePost(post);
                          }}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.postMenuText,
                              styles.postMenuTextDanger,
                            ]}
                          >
                            Excluir
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                {mediaItems.length > 0 ? (
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.postMediaList}
                  >
                    {mediaItems.map((media, index) => {
                      const mediaUri = media.imageBase64
                        ? `data:image/jpeg;base64,${media.imageBase64}`
                        : media.imageUrl;
                      if (!mediaUri) {
                        return null;
                      }
                      return (
                        <TouchableOpacity
                          key={`${post.id}-${media.position}-${mediaUri}`}
                          style={styles.postMediaItem}
                          activeOpacity={0.85}
                          onPress={() => handleOpenViewer(mediaItems, index)}
                        >
                          <Image
                            source={{ uri: mediaUri }}
                            style={styles.postMediaImage}
                            cachePolicy="memory-disk"
                            contentFit="cover"
                          />
                        </TouchableOpacity>
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
                      color={isLiked ? Color.supportiveChichi : Color.piccolo}
                    />
                    <Text
                      style={[
                        styles.postActionLabel,
                        isLiked && styles.postActionLabelHighlighted,
                      ]}
                    >
                      {post.likeCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postActionItem}
                    activeOpacity={0.85}
                    onPress={() => handleOpenComments(post.id, isLiked)}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={Color.piccolo}
                    />
                    <Text style={styles.postActionLabel}>
                      {(post.comments ?? []).length}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postShare}
                    activeOpacity={0.85}
                    onPress={() => handleSharePost(post)}
                  >
                    <Ionicons
                      name="share-outline"
                      size={18}
                      color={Color.piccolo}
                    />
                    <Text style={styles.postShareLabel}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={isViewerOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseViewer}
      >
        <View style={styles.viewerBackdrop}>
          <TouchableOpacity
            style={[styles.viewerClose, { top: Math.max(insets.top, 20) + 8 }]}
            onPress={handleCloseViewer}
            accessibilityRole="button"
            accessibilityLabel="Fechar imagem"
          >
            <Ionicons name="close" size={22} color={Color.mainGoten} />
          </TouchableOpacity>

          <FlatList
            data={viewerSlides}
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
              {viewerDisplayIndex} / {viewerTotal}
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
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: StyleVariable.px6,
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
    position: "relative",
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
    position: "relative",
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
  moreButton: {
    padding: StyleVariable.px2,
  },
  postMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  postMenu: {
    position: "absolute",
    right: 0,
    bottom: 44,
    backgroundColor: Color.mainGohan,
    borderRadius: Border.br_10,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.12)",
    shadowColor: "rgba(0,0,0,0.18)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
    minWidth: 160,
    zIndex: 2,
  },
  postMenuItem: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
  },
  postMenuText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.hit,
  },
  postMenuTextDanger: {
    color: Color.supportiveChichi,
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
    color: Color.supportiveChichi,
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
  viewerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
  },
  viewerClose: {
    position: "absolute",
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
