let admin = require('firebase-admin');
if (admin && admin.default) admin = admin.default;
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('serviceAccountKey.json not found in project root. Place your Firebase service account key there.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(keyPath);
} catch (e) {
  console.error('Failed to load serviceAccountKey.json:', e.message || e);
  process.exit(1);
}

const certFn = admin && admin.credential && typeof admin.credential.cert === 'function'
  ? admin.credential.cert
  : (typeof admin.cert === 'function' ? admin.cert : null);

if (!certFn) {
  console.error('No certificate function available on firebase-admin. Keys:', Object.keys(admin || {}));
  process.exit(1);
}

admin.initializeApp({
  credential: certFn(serviceAccount),
});

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

async function run() {
  try {
    const blueprintPath = path.join(__dirname, 'menu.blueprint.json');
    if (!fs.existsSync(blueprintPath)) {
      console.error('menu.blueprint.json not found. Create it with your menu payload.');
      process.exit(1);
    }

    const raw = fs.readFileSync(blueprintPath, 'utf8');
    const items = JSON.parse(raw);

    const batch = db.batch();
    items.forEach((item) => {
      const ref = db.collection('menuItems').doc(item.id);
      batch.set(ref, item, { merge: true });
      console.log('Queued:', item.id);
    });

    await batch.commit();
    console.log('Successfully imported', items.length, 'menu items to Firestore (collection: menuItems).');
    process.exit(0);
  } catch (err) {
    console.error('Error importing blueprint:', err);
    process.exit(2);
  }
}

run();
