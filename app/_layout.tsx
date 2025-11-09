import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
