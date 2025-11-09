import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
} from "../GlobalStyles";

const myCommunities = [
  {
    id: "1",
    name: "Clube Quinze Premium",
    description: "Dicas exclusivas e eventos para membros Select.",
    members: 428,
    unread: 6,
  },
  {
    id: "2",
    name: "Bem-estar e Lifestyle",
    description: "Compartilhe experiências que elevam sua rotina.",
    members: 289,
    unread: 2,
  },
];

const myPosts = [
  {
    id: "1",
    author: "Equipe Quinze",
    timestamp: "Hoje · 06:00",
    content:
      "Você sabia que segundo o calendário maia, hoje é conhecido como 'um dia fora do tempo'? Aproveite para desacelerar e cuidar de você.",
    likes: 16,
    comments: 3,
  },
  {
    id: "2",
    author: "André Luis",
    timestamp: "Ontem · 18:40",
    content:
      "Acabei de experimentar o tratamento facial Quinze Select e recomendo demais! Quem topa marcar juntos semana que vem?",
    likes: 24,
    comments: 7,
  },
];

const ComunidadeMeusPostsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
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
          <TouchableOpacity style={[styles.segmentButton, styles.segmentButtonActive]}>
            <Text style={[styles.segmentLabel, styles.segmentLabelActive]}>Meus posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.segmentButton}>
            <Text style={styles.segmentLabel}>Minha comunidade</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.composeCard}>
          <View style={styles.composeHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>AL</Text>
            </View>
            <View style={styles.composeTexts}>
              <Text style={styles.composeTitle}>Escreva algo para a comunidade</Text>
              <Text style={styles.composeSubtitle}>
                Compartilhe novidades, conquistas ou dúvidas.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.publishButton} activeOpacity={0.85}>
            <Ionicons name="send" size={16} color={Color.mainGoten} />
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas interações</Text>
          <Text style={styles.sectionSubtitle}>Acompanhe o que rolou recentemente</Text>
        </View>

        {myPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatarSmall}>
                <Ionicons name="person" size={16} color={Color.mainGoten} />
              </View>
              <View style={styles.postHeaderTexts}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postTimestamp}>{post.timestamp}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={18} color={Color.mainTrunks} />
              </TouchableOpacity>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postActions}>
              <View style={styles.postActionItem}>
                <Ionicons name="heart-outline" size={18} color={Color.piccolo} />
                <Text style={styles.postActionLabel}>{post.likes}</Text>
              </View>
              <View style={styles.postActionItem}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={Color.piccolo} />
                <Text style={styles.postActionLabel}>{post.comments}</Text>
              </View>
              <TouchableOpacity style={styles.postShare}>
                <Ionicons name="share-outline" size={18} color={Color.piccolo} />
                <Text style={styles.postShareLabel}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas comunidades</Text>
          <Text style={styles.sectionSubtitle}>Descubra novidades e participe mais</Text>
        </View>

        {myCommunities.map((community) => (
          <View key={community.id} style={styles.communityCard}>
            <View style={styles.communityHeader}>
              <View style={styles.avatarSmall}>
                <Ionicons name="people" size={16} color={Color.mainGoten} />
              </View>
              <View style={styles.communityTexts}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityDescription}>{community.description}</Text>
              </View>
            </View>
            <View style={styles.communityMeta}>
              <View style={styles.communityMetaItem}>
                <Ionicons name="person-outline" size={14} color={Color.piccolo} />
                <Text style={styles.communityMetaLabel}>{community.members} membros</Text>
              </View>
              <View style={styles.communityMetaItem}>
                <Ionicons name="notifications-outline" size={14} color={Color.supportiveChichi} />
                <Text style={styles.communityAlertLabel}>{community.unread} novos</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.communityButton} activeOpacity={0.85}>
              <Text style={styles.communityButtonText}>Entrar na conversa</Text>
              <Ionicons name="arrow-forward" size={16} color={Color.mainGoten} />
            </TouchableOpacity>
          </View>
        ))}
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
    fontFamily: FontFamily.dMSansBold,
    color: Color.hit,
  },
  communityDescription: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  communityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_16,
  },
  communityMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gap.gap_4,
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
    justifyContent: "flex-start",
    gap: Gap.gap_8,
    backgroundColor: Color.piccolo,
  paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_16,
  },
  communityButtonText: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGoten,
  },
});

export default ComunidadeMeusPostsScreen;
