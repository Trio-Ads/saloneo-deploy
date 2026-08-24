// One-time: give every user a unique public slug (earliest account keeps the base slug, later duplicates get -2, -3…).
// Usage: MONGODB_URI=mongodb://127.0.0.1:27017/saloneo node scripts/backfill-user-slugs.js [--dry]
const { MongoClient } = require('mongodb');
const DRY = process.argv.includes('--dry');
const slugify = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
(async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const users = client.db().collection('users');
  const taken = new Set((await users.find({ slug: { $type: 'string' } }).project({ slug: 1 }).toArray()).map(u => u.slug));
  for (const u of await users.find({ slug: { $exists: false } }).sort({ createdAt: 1 }).toArray()) {
    const base = slugify(u.establishmentName || `${u.firstName || ''} ${u.lastName || ''}`) || 'salon';
    let slug = base;
    for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
    taken.add(slug);
    console.log(`${u.email}: ${slug}`);
    if (!DRY) await users.updateOne({ _id: u._id }, { $set: { slug } });
  }
  console.log(DRY ? 'dry run, DB untouched' : 'done');
  await client.close();
})();
