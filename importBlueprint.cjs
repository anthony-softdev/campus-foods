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

async function importBlueprint(blueprintName, collectionName, idField = 'id') {
  const blueprintPath = path.join(__dirname, blueprintName);
  if (!fs.existsSync(blueprintPath)) {
    console.warn(`${blueprintName} not found, skipping ${collectionName} import.`);
    return 0;
  }

  const raw = fs.readFileSync(blueprintPath, 'utf8');
  const items = JSON.parse(raw);
  const batch = db.batch();

  items.forEach((item) => {
    const docId = item[idField];
    if (!docId) {
      throw new Error(`${blueprintName} item missing '${idField}' field.`);
    }
    const ref = db.collection(collectionName).doc(docId);
    batch.set(ref, item, { merge: true });
    console.log(`Queued ${collectionName}:`, docId);
  });

  await batch.commit();
  console.log(`Successfully imported ${items.length} ${collectionName} documents.`);
  return items.length;
}

async function run() {
  try {
    const imported = [];
    const menuCount = await importBlueprint('menu.blueprint.json', 'menuItems', 'id');
    if (menuCount) imported.push(`${menuCount} menu item(s)`);

    const orderCount = await importBlueprint('order.blueprint.json', 'orders', 'id');
    if (orderCount) imported.push(`${orderCount} order(s)`);

    if (imported.length === 0) {
      console.error('No blueprint files found to import. Place menu.blueprint.json and/or order.blueprint.json in the project root.');
      process.exit(1);
    }

    console.log('Import completed:', imported.join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Error importing blueprint:', err);
    process.exit(2);
  }
}

run();
