import { usePathname, useRouter } from "expo-router";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Padding } from "../GlobalStyles";
import MenuDeNavegao from "./MenuDeNavegao";

const navItems = [
  {
    key: "home",
    label: "Home",
    icon: "home-outline" as const,
    path: "/admin-dashboard" as const,
  },
  {
    key: "agenda",
    label: "Agenda",
    icon: "calendar-outline" as const,
    path: "/admin-agenda" as const,
  },
  {
    key: "community",
    label: "Comunidade",
    icon: "people-outline" as const,
    path: "/community" as const,
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "person-outline" as const,
    path: "/(tabs)/profile" as const,
  },
] as const;

export const AdminNavbar = memo(function AdminNavbar({
  activePath,
}: {
  activePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current = activePath ?? pathname;

  const activeKey = useMemo(() => {
    const match = navItems.find((item) => current.startsWith(item.path));
    return match?.key ?? navItems[0].key;
  }, [current]);

  const handleSelectTab = (key: string) => {
    if (key === "home") {
      // Home deve sempre levar para o dashboard novo
      router.replace("/admin-dashboard");
      return;
    }

    const target = navItems.find((item) => item.key === key);
    if (target) {
      router.replace(target.path);
      return;
    }

    // fallback: always land on admin dashboard
    router.replace("/admin-dashboard");
  };

  return (
    <View style={styles.container}>
      <MenuDeNavegao
        activeKey={activeKey}
        items={[...navItems]}
        onSelectTab={handleSelectTab}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Padding.padding_24,
    paddingBottom: Padding.padding_24,
    paddingTop: Padding.padding_12,
    backgroundColor: "transparent",
  },
});

export default AdminNavbar;
