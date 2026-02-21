import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => null}
    >
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
