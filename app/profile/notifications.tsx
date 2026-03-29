import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Border, Color, FontFamily, FontSize, LineHeight, Padding } from "../../GlobalStyles";

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync("push_notifications_enabled").then((val) => {
      if (val === "false") {
        setIsEnabled(false);
      }
    });
  }, []);

  const toggleSwitch = async (value: boolean) => {
    setIsEnabled(value);
    await SecureStore.setItemAsync("push_notifications_enabled", String(value));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Color.hit} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Receba lembretes de agendamentos e atualizações importantes sobre o seu clube.
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Habilitar Notificações Push</Text>
          <Switch
            trackColor={{ false: "#767577", true: Color.piccolo }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
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
  content: { padding: Padding.padding_24, gap: 24 },
  description: { fontSize: FontSize.fs_14, color: Color.mainTrunks, lineHeight: LineHeight.lh_24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Color.mainBeerus,
  },
  rowLabel: { fontSize: FontSize.fs_16, fontFamily: FontFamily.dMSansBold, color: Color.hit },
});
