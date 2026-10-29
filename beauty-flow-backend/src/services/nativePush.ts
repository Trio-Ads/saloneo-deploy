/**
 * Push to the store apps (Capacitor), with Node built-ins only.
 * iOS → APNs (token auth .p8): APNS_KEY_ID, APNS_TEAM_ID, APNS_KEY (the .p8 text, \n allowed), APNS_BUNDLE_ID (default app.saloneo),
 *        APNS_PRODUCTION=1 for App Store / TestFlight builds (sandbox otherwise).
 * Android → FCM HTTP v1: FCM_SERVICE_ACCOUNT (the Firebase service-account JSON, raw or base64).
 * A platform without credentials is skipped silently (its tokens are kept for when it's configured).
 */
import crypto from 'crypto';
import http2 from 'http2';
import type { PushPayload } from './push';

/** 'sent' | 'gone' (token dead: drop it) | 'skipped' (platform not configured) | 'failed' */
export type NativeResult = 'sent' | 'gone' | 'skipped' | 'failed';

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const pem = (v: string) => v.replace(/\\n/g, '\n');

/* ── APNs ───────────────────────────────────────────────────── */

let apnsJwt: { token: string; at: number } | null = null;
export function apnsToken(env = process.env, now = Date.now()): string | null {
  if (!env.APNS_KEY_ID || !env.APNS_TEAM_ID || !env.APNS_KEY) return null;
  // Apple wants the token refreshed between 20 and 60 minutes
  if (apnsJwt && now - apnsJwt.at < 40 * 60_000) return apnsJwt.token;
  const head = b64url(JSON.stringify({ alg: 'ES256', kid: env.APNS_KEY_ID }));
  const claims = b64url(JSON.stringify({ iss: env.APNS_TEAM_ID, iat: Math.floor(now / 1000) }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${claims}`), { key: pem(env.APNS_KEY), dsaEncoding: 'ieee-p1363' });
  apnsJwt = { token: `${head}.${claims}.${b64url(sig)}`, at: now };
  return apnsJwt.token;
}

export const apnsBody = (p: PushPayload) =>
  JSON.stringify({ aps: { alert: { title: p.title, body: p.body }, sound: 'default', ...(p.tag ? { 'thread-id': p.tag } : {}) }, url: p.url });

function sendApns(token: string, p: PushPayload): Promise<NativeResult> {
  const jwt = apnsToken();
  if (!jwt) return Promise.resolve('skipped');
  const host = process.env.APNS_PRODUCTION === '1' ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
  return new Promise((resolve) => {
    // ponytail: one HTTP/2 connection per notification; keep a pooled session if volume grows
    const client = http2.connect(host);
    client.on('error', () => resolve('failed'));
    const req = client.request({
      ':method': 'POST', ':path': `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': process.env.APNS_BUNDLE_ID || 'app.saloneo',
      'apns-push-type': 'alert', 'apns-priority': '10',
      ...(p.tag ? { 'apns-collapse-id': p.tag.slice(0, 64) } : {}),
    });
    let status = 0;
    let body = '';
    req.on('response', (h) => { status = Number(h[':status']); });
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      client.close();
      const reason = body ? (JSON.parse(body).reason as string) : '';
      resolve(status === 200 ? 'sent' : status === 410 || reason === 'BadDeviceToken' || reason === 'Unregistered' ? 'gone' : 'failed');
    });
    req.on('error', () => { client.close(); resolve('failed'); });
    req.setTimeout(10_000, () => { req.close(); client.close(); resolve('failed'); });
    req.end(apnsBody(p));
  });
}

/* ── FCM ────────────────────────────────────────────────────── */

const serviceAccount = () => {
  const raw = process.env.FCM_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    return JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

let fcmAccess: { token: string; until: number } | null = null;
async function fcmAccessToken(sa: any): Promise<string> {
  if (fcmAccess && Date.now() < fcmAccess.until) return fcmAccess.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${claims}`), pem(sa.private_key));
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claims}.${b64url(sig)}` }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new Error(`FCM auth ${res.status}`);
  fcmAccess = { token: data.access_token, until: Date.now() + (data.expires_in - 300) * 1000 };
  return fcmAccess.token;
}

export const fcmMessage = (token: string, p: PushPayload) => ({
  message: {
    token,
    notification: { title: p.title, body: p.body },
    data: { url: p.url },
    android: { priority: 'high', notification: { color: '#F97316', icon: 'ic_stat_saloneo', ...(p.tag ? { tag: p.tag } : {}) } },
  },
});

async function sendFcm(token: string, p: PushPayload): Promise<NativeResult> {
  const sa = serviceAccount();
  if (!sa) return 'skipped';
  try {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await fcmAccessToken(sa)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(fcmMessage(token, p)),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return 'sent';
    const err: any = await res.json().catch(() => ({}));
    const code = err?.error?.details?.find((d: any) => d.errorCode)?.errorCode || err?.error?.status;
    return res.status === 404 || code === 'UNREGISTERED' ? 'gone' : 'failed';
  } catch {
    return 'failed';
  }
}

/** Which store apps can receive push right now (the app asks before registering: Android crashes without Firebase). */
export const nativeConfigured = () => ({ ios: !!apnsToken(), android: !!serviceAccount() });

/** endpoint = 'apns:<token>' or 'fcm:<token>' (how native devices are stored next to web push subscriptions). */
export function sendNative(endpoint: string, p: PushPayload): Promise<NativeResult> {
  const [kind, token] = [endpoint.slice(0, endpoint.indexOf(':')), endpoint.slice(endpoint.indexOf(':') + 1)];
  return kind === 'apns' ? sendApns(token, p) : kind === 'fcm' ? sendFcm(token, p) : Promise.resolve('failed');
}
