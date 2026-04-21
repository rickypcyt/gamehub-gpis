import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function seedDatabase() {
  // Remove pooler from connection string for direct connection
  const connectionString = process.env.DATABASE_URL.replace('-pooler', '');
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Neon database');

    console.log('Reading seed.sql...');
    const seedPath = path.join(process.cwd(), 'neon', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    console.log('Executing seed.sql...');
    await client.query(seedSql);

    console.log('✓ Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
