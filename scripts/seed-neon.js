import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function seedDatabase() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  // Remove pooler from connection string for direct connection
  const connectionString = process.env.DATABASE_URL.replace('-pooler', '');
  console.log('Connection string (first 20 chars):', connectionString.substring(0, 20) + '...');

  const client = new Client({
    connectionString,
  });

  try {
    console.log('Attempting to connect to Neon database...');
    await client.connect();
    console.log('✓ Connected to Neon database');

    console.log('Reading seed.sql...');
    const seedPath = path.join(process.cwd(), 'neon', 'seed.sql');
    console.log('Seed path:', seedPath);

    if (!fs.existsSync(seedPath)) {
      console.error('ERROR: seed.sql file not found at:', seedPath);
      process.exit(1);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    console.log('✓ seed.sql read successfully');
    console.log('SQL length:', seedSql.length);

    console.log('Executing seed.sql...');
    await client.query(seedSql);

    console.log('✓ Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
