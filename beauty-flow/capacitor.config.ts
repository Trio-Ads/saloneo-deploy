import type { CapacitorConfig } from '@capacitor/cli';

// The app shows the live site (same code as the web, updated by every deploy).
// `native-shell` only holds the page shown when the server can't be reached (built by `npm run cap:sync`).
// Local tests: CAP_SERVER_URL=http://localhost:4173 npm run cap:sync
const url = process.env.CAP_SERVER_URL || 'https://www.saloneo.app';

const config: CapacitorConfig = {
  appId: 'app.saloneo',
  appName: 'Saloneo',
  webDir: 'native-shell',
  backgroundColor: '#ffffff',
  server: {
    url,
    cleartext: url.startsWith('http://'),
    errorPath: 'offline.html',
    // Card payments (SATIM) stay inside the app so the return page lands back in it
    allowNavigation: ['satim.dz', '*.satim.dz'],
  },
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
};

export default config;
