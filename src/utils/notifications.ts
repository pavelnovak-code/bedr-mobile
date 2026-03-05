import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Konfigurace: jak se mají notifikace zobrazovat, když je app v popředí
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registruje zařízení pro push notifikace a vrací Expo push token.
 * Na fyzickém zařízení požádá o oprávnění, na simulátoru vrátí null.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifikace fungují pouze na fyzických zařízeních
  if (!Device.isDevice) {
    console.log('[Push] Push notifikace nejsou dostupné na simulátoru');
    return null;
  }

  // Android: Vytvořit notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Připomínky lekcí',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5C6BC0',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'Obecné notifikace',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  // Zkontroluj / požádej o oprávnění
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Uživatel nepovolil push notifikace');
    return null;
  }

  // Získej Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    console.log('[Push] Expo push token:', tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.error('[Push] Chyba při získávání push tokenu:', err);
    return null;
  }
}
