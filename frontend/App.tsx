import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/colors';
import ThemeWrapper from './src/components/ThemeWrapper';
import AnimatedSplash from './src/components/AnimatedSplash';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { loadUser, isLoading } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

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
      if (appIsReady) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
  }, [appIsReady]);

  const handleAnimationEnd = () => {
    setShowAnimatedSplash(false);
  };

  if (!appIsReady || showAnimatedSplash) {
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
