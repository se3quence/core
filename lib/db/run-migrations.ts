import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('POSTGRES_URL is not set');
  }

  const sql = neon(url);

  const migrationsDir = path.join(process.cwd(), 'lib', 'db', 'migrations');
  const files = await fs.readdir(migrationsDir);
  const migrationFiles = files
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migration .sql files found.');
    return;
  }

  for (const file of migrationFiles) {
    const fullPath = path.join(migrationsDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    console.log(`Applying migration: ${file}`);
    // Use unsafe to run the raw SQL content over HTTP
    await sql.unsafe(content);
    console.log(`Applied: ${file}`);
  }

  console.log('All migrations applied via Neon HTTP.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
