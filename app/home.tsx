import { Redirect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function HomeRoute() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!isMounted) {
          return;
        }

        if (token) {
          setIsAuthenticated(true);
        } else {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Redirect href="/(tabs)" />;
}
