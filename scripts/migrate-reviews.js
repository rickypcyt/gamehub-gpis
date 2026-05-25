import 'dotenv/config';

import pg from 'pg';

const { Client } = pg;

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL.replace('-pooler', '');
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to Neon database');

    // 1. Add parent_id to comments if not exists
    const checkParentId = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'comments' AND column_name = 'parent_id'`
    );
    if (checkParentId.rows.length === 0) {
      await client.query(
        `ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE`
      );
      console.log('Added parent_id to comments');
    } else {
      console.log('parent_id already exists in comments');
    }

    // 2. Create comment_reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comment_reactions (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(comment_id, user_id)
      )
    `);
    console.log('Created comment_reactions table');

    // 3. Create game_reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_reviews (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        author TEXT NOT NULL,
        source TEXT NOT NULL CHECK (source IN ('press', 'user')),
        score NUMERIC,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('Created game_reviews table');

    // 4. Create indexes
    const indexes = [
      { name: 'idx_comments_parent', sql: `CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)` },
      { name: 'idx_comment_reactions_comment', sql: `CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id)` },
      { name: 'idx_games_press_score', sql: `CREATE INDEX IF NOT EXISTS idx_games_press_score ON games(press_score)` },
      { name: 'idx_games_genre', sql: `CREATE INDEX IF NOT EXISTS idx_games_genre ON games USING GIN(genre)` },
      { name: 'idx_games_platform', sql: `CREATE INDEX IF NOT EXISTS idx_games_platform ON games USING GIN(platform)` },
      { name: 'idx_game_reviews_game', sql: `CREATE INDEX IF NOT EXISTS idx_game_reviews_game ON game_reviews(game_id)` },
    ];

    for (const idx of indexes) {
      await client.query(idx.sql);
      console.log(`Created index: ${idx.name}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
