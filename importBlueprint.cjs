const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

// 1. Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 2. Read your structural blueprint file
const blueprint = JSON.parse(fs.readFileSync('./firebase-blueprint.json', 'utf8'));

// Helper function to generate mock data values based on your property definitions
function generateMockValue(propName, propDef) {
  if (propDef.enum) return propDef.enum[1] || propDef.enum[0]; // Pick an item from your allowed enum arrays
  
  if (propDef.type === 'number') return 2500;
  if (propDef.type === 'boolean') return true;
  if (propDef.type === 'array') return [];
  
  // Custom mock strings based on field descriptions
  if (propName.toLowerCase().includes('email')) return "tonyoguamas@gmail.com";
  if (propName.toLowerCase().includes('phone')) return "08113860805";
  if (propName.toLowerCase().includes('image')) return "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26";
  if (propDef.format === 'date-time') return new Date().toISOString();

  return `Sample ${propName}`;
}

async function buildDatabaseFromBlueprint() {
  console.log("Parsing schemas and injecting dynamic records...");

  // Look through the structural configuration map in your file
  for (const path in blueprint.firestore) {
    const config = blueprint.firestore[path];
    const schemaName = config.schema;
    const entityDef = blueprint.entities[schemaName];

    if (!entityDef) continue;

    // Extract the clean collection name out of the path wrapper (e.g., "/menuItems/{itemId}" -> "menuItems")
    const collectionName = path.split('/')[1];
    const sampleDocId = `mock_${collectionName}_id`;

    // Loop through the schema properties to build a real document object dynamically
    const mockDocument = {};
    for (const propName in entityDef.properties) {
      const propDef = entityDef.properties[propName];
      mockDocument[propName] = generateMockValue(propName, propDef);
    }

    // Force unique sync IDs where required
    if (mockDocument.id) mockDocument.id = sampleDocId;

    // Write the document directly to the generated collection path
    await db.collection(collectionName).doc(sampleDocId).set({
      ...mockDocument,
      createdAt: FieldValue.serverTimestamp() // Overwrites with native timestamp server-side
    });

    console.log(`✓ Generated and loaded collection: /${collectionName}/${sampleDocId}`);
  }

  console.log("\nAll schema collections successfully built and populated!");
  process.exit(0);
}

buildDatabaseFromBlueprint().catch((err) => {
  console.error("Blueprint compilation failed:", err);
  process.exit(1);
});