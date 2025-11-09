const Stack = createNativeStackNavigator();
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import Cadastro10 from "./screens/Cadastro10";
import Agendamento11 from "./components/Agendamento11";
import Perfil10 from "./components/Perfil10";
import ComunidadeMeusPosts10 from "./components/ComunidadeMeusPosts10";
import Home10 from "./components/Home10";
import Perfil101 from "./components/Perfil101";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, Pressable, TouchableOpacity } from "react-native";

const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);

  const [fontsLoaded, error] = useFonts({
    "DMSans-Regular": require("./assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Bold": require("./assets/fonts/DMSans-Bold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        {hideSplashScreen ? (
          <Stack.Navigator
            initialRouteName="Cadastro10"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen
              name="Cadastro10"
              component={Cadastro10}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Agendamento11"
              component={Agendamento11}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Perfil10"
              component={Perfil10}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ComunidadeMeusPosts10"
              component={ComunidadeMeusPosts10}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home10"
              component={Home10}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Perfil101"
              component={Perfil101}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : null}
      </NavigationContainer>
    </>
  );
};
export default App;
