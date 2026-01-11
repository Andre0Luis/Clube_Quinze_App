
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MenuDeNavegao, { MenuItem } from "../../components/MenuDeNavegao";
import { getCurrentUser } from "../../services/users";

type CustomTabBarProps = BottomTabBarProps & {
  canSeeCommunity: boolean;
};

const routeConfig: Record<string, MenuItem> = {
  index: { key: "index", label: "Home", icon: "home-outline" },
  reserve: { key: "reserve", label: "Reserva", icon: "calendar-outline" },
  community: { key: "community", label: "Comunidade", icon: "people-outline" },
  profile: { key: "profile", label: "Perfil", icon: "person-outline" },
};

const CustomTabBar = memo(({ state, navigation, canSeeCommunity }: CustomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const items = useMemo(() => {
    const baseItems = state.routes
      .map((route) => routeConfig[route.name])
      .filter((item): item is MenuItem => Boolean(item));
    if (!canSeeCommunity) {
      return baseItems.filter((item) => item.key !== "community");
    }
    return baseItems;
  }, [canSeeCommunity, state.routes]);

  const activeRouteName = useMemo(() => {
    const current = state.routes[state.index]?.name;
    if (current === "community" && !canSeeCommunity) {
      // Force fallback to home if community is hidden
      return "index";
    }
    return current;
  }, [canSeeCommunity, state.index, state.routes]);

  const handleSelectTab = (key: string) => {
    const targetRoute = state.routes.find((route) => route.name === key);
    if (!targetRoute) {
      console.warn(`Rota não encontrada para a aba: ${key}`);
      return;
    }
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
  const [canSeeCommunity, setCanSeeCommunity] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;
        const allowed = user?.role === "CLUB_ADMIN" || user?.membershipTier === "QUINZE_SELECT";
        setCanSeeCommunity(Boolean(allowed));
      } catch (error) {
        // fallback: hide community for unknown user
        if (isMounted) {
          setCanSeeCommunity(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} canSeeCommunity={canSeeCommunity} />}>
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
      {canSeeCommunity ? (
        <Tabs.Screen
          name="community"
          options={{
            title: "Comunidade",
            headerShown: false,
          }}
        />
      ) : null}
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
