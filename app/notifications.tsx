import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, FontFamily, FontSize, Padding } from "../GlobalStyles";

export default function NotificationsListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Notificações</Text>
      </View>
      
      <View style={styles.emptyState}>
        <Ionicons name="notifications-off-outline" size={48} color={Color.mainTrunks} />
        <Text style={styles.emptyText}>Você não tem novas notificações no momento.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.mainGohan },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Padding.padding_24,
    paddingVertical: Padding.padding_16,
    borderBottomWidth: 1,
    borderBottomColor: Color.mainBeerus,
  },
  backButton: { marginRight: 16 },
  title: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  emptyText: { fontSize: FontSize.fs_16, color: Color.mainTrunks, textAlign: "center", fontFamily: FontFamily.dMSansRegular },
});
