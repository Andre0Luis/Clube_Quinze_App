
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MenuDeNavegao, { MenuItem } from "../../components/MenuDeNavegao";

const routeConfig: Record<string, MenuItem> = {
  index: { key: "index", label: "Home", icon: "home-outline" },
  reserve: { key: "reserve", label: "Reserva", icon: "calendar-outline" },
  community: { key: "community", label: "Comunidade", icon: "people-outline" },
  profile: { key: "profile", label: "Perfil", icon: "person-outline" },
};

const CustomTabBar = memo(({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const items = useMemo(() => {
    return state.routes
      .map((route) => routeConfig[route.name])
      .filter((item): item is MenuItem => Boolean(item));
  }, [state.routes]);

  const activeRouteName = state.routes[state.index]?.name;

  const handleSelectTab = (key: string) => {
    const targetIndex = state.routes.findIndex((route) => route.name === key);
    if (targetIndex === -1) {
      console.warn(`Rota não encontrada para a aba: ${key}`);
      return;
    }

    const targetRoute = state.routes[targetIndex];
    const event = navigation.emit({
      type: "tabPress",
      target: targetRoute.key,
      canPreventDefault: true,
    });

    if (event.defaultPrevented) {
      return;
    }

    navigation.navigate(targetRoute.name);
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 16 }]}
    >
      <MenuDeNavegao
        activeKey={activeRouteName}
        items={items}
        onSelectTab={handleSelectTab}
      />
    </View>
  );
});

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reserve"
        options={{
          title: "Reserva",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Comunidade",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
});
