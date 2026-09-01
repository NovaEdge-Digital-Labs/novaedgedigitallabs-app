import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/colors';
import ThemeWrapper from './src/components/ThemeWrapper';
import AnimatedSplash from './src/components/AnimatedSplash';
import { Ionicons } from '@expo/vector-icons';

import CustomAlert from './src/components/CustomAlert';
import { patchGlobalAlert } from './src/store/alertStore';
import { authApi } from './src/api/authApi';
import { useAppConfigStore } from './src/store/appConfigStore';
import { Linking } from 'react-native';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Intercept standard RN Alert.alert calls to display custom styled modal
patchGlobalAlert();

export default function App() {
  const { user, loadUser, isLoading } = useAuthStore();
  const { config } = useAppConfigStore();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          loadUser(),
          useAppConfigStore.getState().fetchConfig()
        ]);
        // Check biometric preference
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const savedSettings = await AsyncStorage.getItem('NOVAEDGE_PRIVACY_SECURITY_SETTINGS_V1');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.biometric) {
            setIsBiometricLocked(true);
          }
        }
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

  useEffect(() => {
    async function promptBiometric() {
      // Only prompt if we finished loading, user is logged in, biometric is enabled, and splash is done
      if (appIsReady && !showAnimatedSplash && isBiometricLocked && user && !biometricVerified) {
        const LocalAuthentication = require('expo-local-authentication');
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock NovaEdge Digital Labs',
            fallbackLabel: 'Use Passcode',
          });
          if (result.success) {
            setBiometricVerified(true);
          } else {
            // Wait a moment and they can try again or just stay locked out
          }
        } else {
          // If no hardware/enrolled, just let them in
          setBiometricVerified(true);
        }
      }
    }
    promptBiometric();
  }, [appIsReady, showAnimatedSplash, isBiometricLocked, user, biometricVerified]);

  useEffect(() => {
    if (appIsReady) {
      // Push notifications removed
    }
  }, [user, appIsReady]);

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

  // --- Global App Config Checks ---
  const currentAppVersion = '1.0.0'; // Hardcoded for now, ideally from expo-constants
  const needsUpdate = config && config.minimumAppVersion && config.minimumAppVersion > currentAppVersion;
  const isMaintenance = config && config.isMaintenanceMode;

  if (isMaintenance) {
    return (
      <SafeAreaProvider>
        <ThemeWrapper>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
            <Ionicons name="construct-outline" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
            <Text style={{ color: COLORS.text, fontSize: 24, marginBottom: 15, fontWeight: 'bold' }}>Under Maintenance</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 30, textAlign: 'center', paddingHorizontal: 40, fontSize: 16 }}>
              We are currently upgrading our servers to serve you better. Please check back later.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.surface, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, borderWidth: 1, borderColor: COLORS.border }}
              onPress={() => useAppConfigStore.getState().fetchConfig()}
            >
              <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 16 }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </ThemeWrapper>
      </SafeAreaProvider>
    );
  }

  if (needsUpdate) {
    return (
      <SafeAreaProvider>
        <ThemeWrapper>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
            <Ionicons name="cloud-download-outline" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
            <Text style={{ color: COLORS.text, fontSize: 24, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' }}>Update Required</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 30, textAlign: 'center', paddingHorizontal: 40, fontSize: 16 }}>
              A new mandatory version of NovaEdge Digital Labs is available. Please update to continue.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 }}
              onPress={() => Linking.openURL(config.appDownloadLink || 'https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech')}
            >
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </ThemeWrapper>
      </SafeAreaProvider>
    );
  }
  // --- End Global App Config Checks ---

  // If biometric is locked, user is logged in, and not yet verified, show a locked screen
  if (isBiometricLocked && user && !biometricVerified) {
    return (
      <SafeAreaProvider>
        <ThemeWrapper>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
            <Text style={{ color: COLORS.text, fontSize: 20, marginBottom: 20, fontWeight: 'bold' }}>App Locked</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 40, textAlign: 'center', paddingHorizontal: 40 }}>
              Unlock with Face ID or Touch ID to access NovaEdge Digital Labs.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 }}
              onPress={() => setBiometricVerified(false)} // This will re-trigger the effect to prompt again
            >
              <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 16 }}>Unlock Now</Text>
            </TouchableOpacity>
          </View>
        </ThemeWrapper>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeWrapper>
        <AppNavigator />
      </ThemeWrapper>
      <CustomAlert />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Styles moved to AnimatedSplash
});
