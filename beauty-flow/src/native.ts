import { Capacitor } from '@capacitor/core';

/** Running inside the App Store / Play Store app (Capacitor), not a browser. */
export const isNativeApp = Capacitor.isNativePlatform();
/** iOS app: plans can't be sold in it outside Apple's in-app purchase (App Store 3.1.1), so no upgrade buttons there. */
export const isIosApp = Capacitor.getPlatform() === 'ios';
