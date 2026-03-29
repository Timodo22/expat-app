import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');

const db = new Database(dbPath);

// Initialize database with schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

export default db;
