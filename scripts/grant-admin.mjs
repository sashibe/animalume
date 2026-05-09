import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/grant-admin.mjs <uid>');
  process.exit(1);
}

await getAuth().setCustomUserClaims(uid, { role: 'admin' });
console.log(`Granted admin role to ${uid}`);
