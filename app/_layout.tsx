import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { setUnauthorizedCallback } from '@/api/client';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, restoreSession, logout } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout().then(() => router.replace('/(auth)/login'));
    });
  }, [logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={MD3LightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="festival/[festivalId]" />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
