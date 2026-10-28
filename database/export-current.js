// Run from the repository root with mongosh --file database/export-current.js.
// Reads the source database; writes scripts and a manifest in ./database.
// SOOPI_EXPORT_DB chooses another source (e.g. soopi_mongodb_demo); its files are named after that database.
(() => {
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  const sourceName = process.env.SOOPI_EXPORT_DB || 'soopi_mongodb';
  const source = db.getSiblingDB(sourceName);
  const directory = path.resolve('database');
  const canonical = (value, indent = 0) => EJSON.stringify(value, null, indent, { relaxed: false });
  const digest = value => crypto.createHash('sha256').update(canonical(value)).digest('hex');
  const literal = value => 'EJSON.deserialize(' + canonical(value, 2) + ', { relaxed: false })';
  const infos = source.getCollectionInfos().sort((a, b) => a.name.localeCompare(b.name));
  if (!infos.length) throw new Error('Source database has no collections: ' + sourceName);
  if (infos.some(c => c.type !== 'collection' || c.name.startsWith('system.') || c.options.capped)) {
    throw new Error('This exporter supports ordinary application collections only.');
  }
  const capturedAt = new Date().toISOString();
  const collections = infos.map(info => ({
    name: info.name,
    options: info.options,
    indexes: source.getCollection(info.name).getIndexes()
      .map(({ v, ns, buildUUID, ...index }) => index)
      .sort((a, b) => a.name.localeCompare(b.name)),
    documents: [],
  }));
  // All document reads share one snapshot, including counters and audit logs.
  const session = source.getMongo().startSession();
  session.startTransaction({ readConcern: { level: 'snapshot' } });
  try {
    const snapshot = session.getDatabase(sourceName);
    for (const collection of collections) {
      collection.documents = snapshot.getCollection(collection.name).find({}).sort({ _id: 1 }).toArray();
    }
  } finally {
    session.abortTransaction();
    session.endSession();
  }
  const manifest = {
    sourceDatabase: sourceName,
    capturedAt,
    serverVersion: source.version(),
    readConcern: 'snapshot',
    totalCollections: collections.length,
    totalDocuments: collections.reduce((sum, c) => sum + c.documents.length, 0),
    totalIndexes: collections.reduce((sum, c) => sum + c.indexes.length, 0),
    includesFileContents: false,
    collections: collections.map(c => ({
      name: c.name,
      documents: c.documents.length,
      indexes: c.indexes.length,
      dataSha256: digest(c.documents),
      indexesSha256: digest(c.indexes),
      optionsSha256: digest(c.options),
    })),
  };
  function render(includeData) {
    const defaultTarget = sourceName + (includeData ? '_restore' : '_schema');
    const lines = [
      '// Soopi MongoDB: ' + (includeData ? 'complete data and index snapshot' : 'collections and indexes only'),
      '// Source: ' + sourceName + '; captured at: ' + capturedAt,
      '// ' + manifest.totalCollections + ' collections; ' + manifest.totalIndexes + ' indexes (including _id_).',
      '// Set SOOPI_RESTORE_DB to choose an EMPTY target database.',
      '// No collections or documents are dropped or overwritten.',
      '// Attachment contents live on disk and must be copied separately.',
      '(() => {',
      '  const targetName = process.env.SOOPI_RESTORE_DB || ' + JSON.stringify(defaultTarget) + ';',
      '  if (!/^[A-Za-z0-9_-]{1,63}$/.test(targetName) || ["admin", "local", "config", "service_center"].includes(targetName.toLowerCase())) {',
      '    throw new Error("Invalid target database: " + targetName);',
      '  }',
      '  const target = db.getSiblingDB(targetName);',
      '  if (target.getCollectionInfos().length !== 0) {',
      '    throw new Error("Target database already has collections: " + targetName + ". Choose an empty database with SOOPI_RESTORE_DB.");',
      '  }',
      '',
    ];
    for (const collection of collections) {
      const name = JSON.stringify(collection.name);
      lines.push('  // Collection: ' + collection.name + ' (' + collection.documents.length + ' documents in source).');
      lines.push('  target.createCollection(' + name + ', ' + literal(collection.options) + ');');
      const indexes = collection.indexes.filter(index => index.name !== '_id_');
      for (const { key, ...options } of indexes) {
        lines.push('  target.getCollection(' + name + ').createIndex(' + literal(key) + ', ' + literal(options) + ');');
      }
      if (includeData) {
        // Small batches also keep each generated insertMany statement readable.
        for (let offset = 0; offset < collection.documents.length; offset += 100) {
          const batch = collection.documents.slice(offset, offset + 100);
          lines.push('  target.getCollection(' + name + ').insertMany(' + literal(batch) + ', { ordered: true });');
        }
      }
      const expected = includeData ? collection.documents.length : 0;
      lines.push('  if (target.getCollection(' + name + ').countDocuments({}) !== ' + expected + ') throw new Error("Count mismatch: ' + collection.name + '");');
      lines.push('');
    }
    lines.push('  print("Restored ' + (includeData ? manifest.totalDocuments : 0) + ' documents in ' + manifest.totalCollections + ' collections to " + targetName);');
    lines.push('})();', '');
    return lines.join('\n');
  }
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, sourceName + '.full.js'), render(true), 'utf8');
  fs.writeFileSync(path.join(directory, sourceName + '.schema.js'), render(false), 'utf8');
  const manifestFile = sourceName === 'soopi_mongodb' ? 'snapshot-manifest.json' : sourceName + '.manifest.json';
  fs.writeFileSync(path.join(directory, manifestFile), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  print(JSON.stringify({ output: directory, capturedAt, collections: manifest.totalCollections, documents: manifest.totalDocuments, indexes: manifest.totalIndexes }));
})();
