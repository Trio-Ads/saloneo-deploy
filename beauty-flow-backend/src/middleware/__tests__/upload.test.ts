// Run: cd beauty-flow-backend && npx ts-node --transpile-only src/middleware/__tests__/upload.test.ts
import assert from 'assert';
import { ownedUploadKey, uploadFolder } from '../upload';
import { canOpenAttachment } from '../../controllers/staff.controller';

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa', B = 'bbbbbbbbbbbbbbbbbbbbbbbb', TM = 'cccccccccccccccccccccccc', TM2 = 'dddddddddddddddddddddddd';

/* DELETE /upload/file: only keys under the salon's own folder */
assert.strictEqual(uploadFolder('logos', A), `saloneo/logos/${A}`);
const own = `saloneo/logos/${A}/logo_1730000000_x1y2.png`;
assert.strictEqual(ownedUploadKey(own, A), own);
assert.strictEqual(ownedUploadKey(`/uploads/${own}`, A), own); // local URL form
assert.strictEqual(ownedUploadKey(`http://localhost:5050/uploads/${own}`, A), own); // absolute URL form
assert.strictEqual(ownedUploadKey(`saloneo/general/${A}/Photo équipe_17300_ab`, A), `saloneo/general/${A}/Photo équipe_17300_ab`); // Cloudinary id, original name
assert.strictEqual(ownedUploadKey(own, B), null); // another salon's file
assert.strictEqual(ownedUploadKey(`saloneo/logos/${B}/x.png`, A), null);
assert.strictEqual(ownedUploadKey('saloneo/logos/x.png', A), null); // legacy key without a salon folder
assert.strictEqual(ownedUploadKey(`saloneo/logos/${A}/../${B}/x.png`, A), null); // traversal
assert.strictEqual(ownedUploadKey(`saloneo/logos/${A}/..`, A), null);
assert.strictEqual(ownedUploadKey(`saloneo/logos/${A}/sub/x.png`, A), null); // nested path
assert.strictEqual(ownedUploadKey(`../../.env`, A), null);
assert.strictEqual(ownedUploadKey(`/etc/passwd`, A), null);
assert.strictEqual(ownedUploadKey(`saloneo/logos/${A}/x\\..\\y`, A), null);
assert.strictEqual(ownedUploadKey({ $ne: '' }, A), null);
assert.strictEqual(ownedUploadKey(own, 'not-an-id'), null);

/* Leave certificates: the salon owner, or the member it belongs to — nobody else */
const file = { userId: A, teamMemberId: TM };
assert.strictEqual(canOpenAttachment({ role: 'owner' }, A, file), true);
assert.strictEqual(canOpenAttachment({ role: 'admin' }, A, file), true); // admin of their own salon
assert.strictEqual(canOpenAttachment({ role: 'owner' }, B, file), false); // another salon's owner
assert.strictEqual(canOpenAttachment({ role: 'staff', teamMemberId: TM }, A, file), true);
assert.strictEqual(canOpenAttachment({ role: 'staff', teamMemberId: TM2 }, A, file), false); // a colleague
assert.strictEqual(canOpenAttachment({ role: 'staff', teamMemberId: TM }, B, file), false);
assert.strictEqual(canOpenAttachment({ role: 'supplier' }, A, file), false);
assert.strictEqual(canOpenAttachment(undefined, A, file), false);

console.log('upload: all assertions passed');
process.exit(0);
