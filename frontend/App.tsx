import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/colors';
import ThemeWrapper from './src/components/ThemeWrapper';
import AnimatedSplash from './src/components/AnimatedSplash';
import { applyWebStyleReset } from './src/utils/webStyleReset';
import { syncPushToken } from './src/utils/pushNotifications';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { loadUser, isLoading, isAuthenticated } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Outfit (display) + Inter (body), matching novaedgedigitallabs.tech.
  // `fontError` is tolerated: TYPOGRAPHY falls back to the system stack.
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    applyWebStyleReset();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await loadUser();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [loadUser]);

  useEffect(() => {
    async function hideSplash() {
      if (appIsReady && (fontsLoaded || fontError)) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [appIsReady, fontsLoaded, fontError]);

  useEffect(() => {
    if (isAuthenticated) {
      syncPushToken();
    }
  }, [isAuthenticated]);

  const handleAnimationEnd = () => {
    setShowAnimatedSplash(false);
  };

  const ready = appIsReady && (fontsLoaded || !!fontError);

  if (!ready || showAnimatedSplash) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplash onAnimationEnd={handleAnimationEnd} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeWrapper>
        <AppNavigator />
      </ThemeWrapper>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Styles moved to AnimatedSplash
});
