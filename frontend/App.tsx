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
import CustomAlert from './src/components/CustomAlert';
import { patchGlobalAlert } from './src/store/alertStore';
import { applyWebStyleReset } from './src/utils/webStyleReset';
import { syncPushToken, requestNotificationPermission } from './src/utils/pushNotifications';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Patch the global Alert.alert to use our CustomAlert
patchGlobalAlert();

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

  // Ask for notification permission as soon as the app is usable. This used to
  // be tied to `isAuthenticated`, so a user who never reached the signed-in
  // state was never prompted at all.
  useEffect(() => {
    if (!appIsReady) return;
    requestNotificationPermission().catch((e) => console.warn('[push] permission error', e));
  }, [appIsReady]);

  // The token can only be stored against a user, so upload it once signed in.
  useEffect(() => {
    if (!isAuthenticated) return;
    syncPushToken().catch((e) => console.warn('[push] sync error', e));
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
      <CustomAlert />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Styles moved to AnimatedSplash
});
