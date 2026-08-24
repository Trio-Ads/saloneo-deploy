// Migrate every Cloudinary URL stored in MongoDB to a local file under uploads/migrated/.
// Usage: MONGODB_URI=mongodb://127.0.0.1:27017/saloneo node scripts/migrate-cloudinary-to-local.js [--dry]
const { MongoClient } = require('mongodb');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const RE = /^https?:\/\/res\.cloudinary\.com\/\S+$/;
const DRY = process.argv.includes('--dry');
const DIR = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'migrated');
fs.mkdirSync(DIR, { recursive: true });

function walk(v, p, out) {
  if (typeof v === 'string') { if (RE.test(v)) out.push([p, v]); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p ? `${p}.${i}` : String(i), out));
  else if (v && typeof v === 'object' && !(v._bsontype)) for (const k of Object.keys(v)) walk(v[k], p ? `${p}.${k}` : k, out);
}

async function download(url) {
  const name = decodeURIComponent(url.split('/').slice(-1)[0].split('?')[0]).replace(/[^\w.-]/g, '_');
  const dest = path.join(DIR, name);
  if (!fs.existsSync(dest)) {
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
    fs.writeFileSync(dest, r.data);
  }
  return `/uploads/migrated/${name}`;
}

(async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  let ok = 0, fail = 0;
  for (const { name } of await db.listCollections().toArray()) {
    const col = db.collection(name);
    for await (const doc of col.find({})) {
      const hits = []; walk(doc, '', hits);
      if (!hits.length) continue;
      const $set = {};
      for (const [p, url] of hits) {
        try { $set[p] = await download(url); ok++; console.log(`${name}/${doc._id} ${p} -> ${$set[p]}`); }
        catch (e) { fail++; console.error(`FAIL ${name}/${doc._id} ${p} ${url}: ${e.message}`); }
      }
      if (!DRY && Object.keys($set).length) await col.updateOne({ _id: doc._id }, { $set });
    }
  }
  console.log(`done: ${ok} migrated, ${fail} failed${DRY ? ' (dry run, DB untouched)' : ''}`);
  await client.close();
})();
