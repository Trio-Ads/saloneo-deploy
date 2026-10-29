// Run: npx ts-node --transpile-only src/services/__tests__/nativePush.test.ts
import assert from 'assert';
import crypto from 'crypto';
import { apnsBody, apnsToken, fcmMessage, sendNative } from '../nativePush';

(async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const env = { APNS_KEY_ID: 'KEY123', APNS_TEAM_ID: 'TEAM456', APNS_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString().replace(/\n/g, '\\n') } as any;

  // APNs JWT: ES256 header/claims Apple expects, signature verifies with the key's public half
  const jwt = apnsToken(env, 1_700_000_000_000)!;
  const [h, c, sig] = jwt.split('.');
  assert.deepStrictEqual(JSON.parse(Buffer.from(h, 'base64url').toString()), { alg: 'ES256', kid: 'KEY123' });
  assert.deepStrictEqual(JSON.parse(Buffer.from(c, 'base64url').toString()), { iss: 'TEAM456', iat: 1_700_000_000 });
  assert.ok(crypto.verify('sha256', Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url')));
  // cached for 40 min, then renewed
  assert.strictEqual(apnsToken(env, 1_700_000_000_000 + 39 * 60_000), jwt);
  assert.notStrictEqual(apnsToken(env, 1_700_000_000_000 + 41 * 60_000), jwt);
  assert.strictEqual(apnsToken({} as any), null);

  const p = { title: 'Nouveau rendez-vous', body: 'Lina : Brushing', url: '/appointments', tag: 'appt-1' };
  assert.deepStrictEqual(JSON.parse(apnsBody(p)), { aps: { alert: { title: p.title, body: p.body }, sound: 'default', 'thread-id': 'appt-1' }, url: '/appointments' });
  const m = fcmMessage('tok', p).message;
  assert.strictEqual(m.token, 'tok');
  assert.deepStrictEqual(m.data, { url: '/appointments' });
  assert.strictEqual(m.android.notification.tag, 'appt-1');

  // No credentials → skipped, never thrown
  delete process.env.APNS_KEY_ID; delete process.env.FCM_SERVICE_ACCOUNT;
  assert.strictEqual(await sendNative('apns:abc', p), 'skipped');
  assert.strictEqual(await sendNative('fcm:abc', p), 'skipped');
  assert.strictEqual(await sendNative('weird:abc', p), 'failed');
  console.log('nativePush: all assertions passed');
})().catch((e) => { console.error(e); process.exit(1); });
