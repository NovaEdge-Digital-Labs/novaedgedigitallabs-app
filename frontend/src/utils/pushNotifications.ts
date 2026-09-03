import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notificationApi';

// Define how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Create the Android notification channel.
 *
 * Guarded on purpose. This used to be awaited un-wrapped ahead of the
 * permission request, so a rejection here rejected the whole registration
 * before `requestPermissionsAsync` was ever reached — the app silently never
 * asked for notification permission. Channel setup is a delivery *preference*;
 * it must never gate the prompt.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  } catch (e) {
    console.warn('[push] Could not create the default notification channel:', e);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  await ensureAndroidChannel();

  if (!Device.isDevice) {
    console.log('[push] Push notifications need a physical device.');
    return null;
  }

  let finalStatus: string;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      // On Android 13+ this is what surfaces the POST_NOTIFICATIONS dialog.
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  } catch (e) {
    console.warn('[push] Permission request failed:', e);
    return null;
  }

  if (finalStatus !== 'granted') {
    console.log(`[push] Notification permission not granted (status: ${finalStatus}).`);
    return null;
  }

  try {
    // The backend sends through Firebase directly, so we need the native FCM
    // registration token rather than an Expo push token.
    const pushTokenData = await Notifications.getDevicePushTokenAsync();
    return pushTokenData.data as string;
  } catch (e) {
    console.warn('[push] Could not obtain a device push token:', e);
    return null;
  }
}

/**
 * Register the device and hand the token to the backend.
 *
 * Resolves to true only when the backend has stored the token. Never rejects,
 * so callers can fire-and-forget without producing an unhandled rejection.
 */
export async function syncPushToken(): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return false;

    await notificationApi.updateFCMToken(token);
    console.log('[push] Device token registered with the backend.');
    return true;
  } catch (e: any) {
    console.warn('[push] Failed to register the device token:', e?.response?.data || e?.message || e);
    return false;
  }
}

/**
 * Ask for notification permission without needing a signed-in user.
 *
 * The token itself can only be stored once we have a session, so this only
 * primes the OS permission; `syncPushToken` does the upload after login.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('[push] Permission request failed:', e);
    return false;
  }
}
