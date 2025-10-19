import * as lancedb from '@lancedb/lancedb';
import path from 'path';

const DB_PATH = process.env.VECTOR_DB_PATH || './data/vectordb';

let db: lancedb.Connection | null = null;

export async function getVectorDB(): Promise<lancedb.Connection> {
  if (db) return db;

  const dbPath = path.resolve(DB_PATH);
  db = await lancedb.connect(dbPath);

  console.log(`[VectorDB] Connected to LanceDB at: ${dbPath}`);

  return db;
}

export async function getCollection(name: string): Promise<lancedb.Table> {
  const database = await getVectorDB();

  try {
    const table = await database.openTable(name);
    return table;
  } catch (error) {
    throw new Error(`Collection "${name}" not found. Please run ingestion script first.`);
  }
}

export async function createCollection(
  name: string,
  data: any[]
): Promise<lancedb.Table> {
  const database = await getVectorDB();

  const tables = await database.tableNames();
  if (tables.includes(name)) {
    await database.dropTable(name);
    console.log(`[VectorDB] Dropped existing collection: ${name}`);
  }

  const table = await database.createTable(name, data);
  console.log(`[VectorDB] Created collection: ${name} with ${data.length} records`);

  return table;
}

export async function searchVectors(
  collectionName: string,
  queryVector: number[],
  limit: number = 5
): Promise<any[]> {
  const table = await getCollection(collectionName);

  const results = await table
    .search(queryVector)
    .limit(limit)
    .toArray();

  return results;
}

export async function closeVectorDB(): Promise<void> {
  if (db) {
    db = null;
    console.log('[VectorDB] Connection closed');
  }
}

export default {
  getVectorDB,
  getCollection,
  createCollection,
  searchVectors,
  closeVectorDB,
};
