import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const resolveInitialRoute = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (!isMounted) {
          return;
        }
        setInitialRoute(token ? '/(tabs)' : '/login');
      } catch {
        if (isMounted) {
          setInitialRoute('/login');
        }
      }
    };

    resolveInitialRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialRoute && !hasNavigated) {
      router.replace(initialRoute);
      setHasNavigated(true);
    }
  }, [initialRoute, hasNavigated, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#ffffff',
      }}
    >
      <Image
        source={require('../assets/images/icon.png')}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
      <Text
        style={{
          marginTop: 72,
          fontSize: 18,
          fontWeight: '600',
          letterSpacing: 1,
          color: '#00053d',
        }}
      >
        Far and beyond
      </Text>
      <ActivityIndicator size="large" color="#00053d" style={{ marginTop: 40 }} />
    </View>
  );
}
