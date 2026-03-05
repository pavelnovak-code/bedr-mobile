import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { registerForPushNotifications } from '../utils/notifications';
import { savePushToken } from '../api/users';

/**
 * Hook pro registraci push notifikací a handling příchozích notifikací.
 * Volá se jednou po přihlášení (v MainTabs nebo RootNavigator).
 */
export function usePushNotifications() {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // 1) Registrace push tokenu
    registerForPushNotifications().then(async (token) => {
      if (token) {
        try {
          await savePushToken(token);
          console.log('[Push] Token uložen na server');
        } catch (err) {
          console.error('[Push] Nepodařilo se uložit token:', err);
        }
      }
    });

    // 2) Listener: notifikace přijata, když je app v popředí
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] Notifikace přijata:', notification.request.content.title);
      }
    );

    // 3) Listener: uživatel klikl na notifikaci
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  /**
   * Navigace na relevantní screen podle dat z notifikace.
   */
  function handleNotificationNavigation(data: Record<string, any>) {
    if (!data?.type) return;

    switch (data.type) {
      case 'lesson_reminder':
        navigation.navigate('Přehled');
        break;
      case 'new_offer':
      case 'new_badge':
      case 'referral_reward':
        navigation.navigate('Profil');
        break;
      default:
        navigation.navigate('Přehled');
        break;
    }
  }
}
