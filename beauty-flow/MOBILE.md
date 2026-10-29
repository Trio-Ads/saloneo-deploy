# Saloneo mobile apps (iOS / Android)

The store apps are Capacitor shells around the live site (`https://www.saloneo.app`): every web deploy updates
them instantly. Store releases are only needed for native changes (icons, permissions, plugins, Capacitor upgrades).

- App id / bundle id: `app.saloneo`
- Config: `capacitor.config.ts` (server URL, SATIM pages kept inside the app, offline page)
- Native projects: `ios/` (Xcode, Swift Package Manager) and `android/` (Gradle)
- In the app: no marketing home, no plan purchase on iOS (App Store rule 3.1.1), in-app account deletion (rule 5.1.1(v)).

## Build

```sh
npm run cap:sync             # always before opening Xcode / Android Studio (writes the offline shell + config)
npx cap open ios             # Xcode → Product → Archive → Distribute (App Store Connect)
npx cap open android         # Android Studio → Build → Generate Signed App Bundle (.aab)
```

Local test against a local stack: `CAP_SERVER_URL=http://localhost:4173 npm run cap:sync`
(serve `vite build` with `vite preview --port 4173`; Android emulator: `adb reverse tcp:4173 tcp:4173` and `tcp:5050`).
Run `npm run cap:sync` again (without the variable) before any release build.

Before each store release: bump `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` (Xcode) and `versionName` / `versionCode` (`android/app/build.gradle`).

## Push notifications (server env on the VPS)

Until these are set, the app shows "notifications coming very soon" and nothing breaks.

**iOS (APNs)**: Apple Developer → Keys → new key with "Apple Push Notifications service" → download the `.p8`.
```
APNS_KEY_ID=<10-char key id>
APNS_TEAM_ID=<10-char team id>
APNS_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APNS_BUNDLE_ID=app.saloneo
APNS_PRODUCTION=1            # TestFlight / App Store builds
```
In Xcode, the signing team must have the Push Notifications capability. `App.entitlements` says `development`;
archives for the store are switched to `production` automatically by Xcode.

**Android (FCM)**: Firebase console → new project → add Android app `app.saloneo` → download
`google-services.json` into `android/app/` (do not commit it publicly) → Project settings → Service accounts →
generate a private key:
```
FCM_SERVICE_ACCOUNT=<the JSON, or its base64>
```
Both the file in the build and the server variable are needed (without the file, the Android app can't register).

## Store listings checklist

- Apple Developer Program (99 $/year), Google Play Console (25 $ once)
- Privacy policy URL (required by both stores)
- Reviewer demo account (salon owner) with sample data
- Screenshots: iPhone 6.9" and 6.5", Android phone
- Apple "App Privacy" and Google "Data safety" forms: email, name, phone (account + bookings), no tracking, no ads
