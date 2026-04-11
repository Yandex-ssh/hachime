import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SavedProvider } from '@/context/SavedContext';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { token, isLoading, isOnboarded } = useAuth();

  // If we're still loading the token, show nothing or a splash screen
  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SavedProvider>
        <Stack>
          {/* If we have a token, show user home. If not, show auth. */}
          {token ? (
            isOnboarded ? (
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
            )
          ) : (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </SavedProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </CustomThemeProvider>
  );
}
