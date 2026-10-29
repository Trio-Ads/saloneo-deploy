import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import api from '../../services/api';
import { isNativeApp } from '../../native';

/** The browser's install prompt (Android / desktop Chrome), captured as soon as it fires. */
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let installPrompt: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const onPwaChange = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/* ── Store app (Capacitor): native push through APNs (iOS) / FCM (Android) ── */
const NATIVE_TOKEN = 'nativePushToken';
const nativeEndpoint = (token: string) => `${Capacitor.getPlatform() === 'ios' ? 'apns' : 'fcm'}:${token}`;
let tokenWaiter: ((token: string) => void) | null = null;

function registerNative() {
  // The store app opens on the salon space, never on the marketing home page
  if (window.location.pathname === '/') window.location.replace('/dashboard');
  PushNotifications.addListener('registration', ({ value }) => {
    localStorage.setItem(NATIVE_TOKEN, value);
    if (localStorage.getItem('token')) api.post('/push/native', { platform: Capacitor.getPlatform(), token: value }).catch(() => undefined);
    tokenWaiter?.(value);
  });
  // Tapping a notification opens its page inside the app (React Router listens to popstate)
  PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
    const url = notification.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });
  // APNs/FCM tokens can change: refresh it at each launch once notifications are on
  PushNotifications.checkPermissions().then((p) => {
    if (p.receive === 'granted' && localStorage.getItem(NATIVE_TOKEN)) PushNotifications.register();
  }).catch(() => undefined);
}

export function registerPwa() {
  if (isNativeApp) { registerNative(); return; }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e as InstallPrompt; emit(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; emit(); });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
  }
}

export const isInstalled = () => isNativeApp ||
  window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canPromptInstall = () => !!installPrompt;

export async function promptInstall() {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice.catch(() => undefined);
  installPrompt = null;
  emit();
}

/** iOS only delivers web push to an app added to the home screen (iOS 16.4+). */
export const pushSupported = () => isNativeApp || 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const b64ToBytes = (b64: string) => {
  const raw = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

const registration = () => navigator.serviceWorker.ready;

/** Store app: push works only once the server has APNs / FCM credentials (and the Android build its Firebase file). */
export async function nativePushAvailable(): Promise<boolean> {
  const { data } = await api.get('/push/key');
  return !!data.native?.[Capacitor.getPlatform()];
}

export async function pushEnabled(): Promise<boolean> {
  if (isNativeApp) return (await PushNotifications.checkPermissions()).receive === 'granted' && !!localStorage.getItem(NATIVE_TOKEN);
  if (!pushSupported() || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return !!(await reg?.pushManager.getSubscription());
}

/** Asks permission, subscribes this device and sends it to the server. Returns the permission state. */
export async function enablePush(): Promise<NotificationPermission> {
  if (isNativeApp) {
    if (!(await nativePushAvailable())) throw new Error('Native push not configured');
    const { receive } = await PushNotifications.requestPermissions();
    if (receive !== 'granted') return receive === 'denied' ? 'denied' : 'default';
    const token = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('No push token')), 15000);
      tokenWaiter = (t) => { clearTimeout(timer); resolve(t); };
      PushNotifications.register().catch(reject);
    }).finally(() => { tokenWaiter = null; });
    await api.post('/push/native', { platform: Capacitor.getPlatform(), token });
    return 'granted';
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  const reg = await registration();
  const { data } = await api.get('/push/key');
  const sub = (await reg.pushManager.getSubscription())
    || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(data.publicKey) });
  await api.post('/push/subscribe', { subscription: sub.toJSON() });
  return permission;
}

/** Stops notifications on this device (also on logout, so the next person on this phone gets none). */
export async function disablePush() {
  if (isNativeApp) {
    const token = localStorage.getItem(NATIVE_TOKEN);
    if (!token) return;
    await api.post('/push/unsubscribe', { endpoint: nativeEndpoint(token) }).catch(() => undefined);
    await PushNotifications.unregister().catch(() => undefined);
    localStorage.removeItem(NATIVE_TOKEN);
    return;
  }
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined);
  await sub.unsubscribe().catch(() => undefined);
}
