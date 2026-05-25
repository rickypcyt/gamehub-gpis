import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  try {
    // 1. Add parent_id to comments if not exists
    const checkParentId = await sql(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'comments' AND column_name = 'parent_id'`
    );
    if (checkParentId.length === 0) {
      await sql(
        `ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE`
      );
      console.log('Added parent_id to comments');
    } else {
      console.log('parent_id already exists in comments');
    }

    // 2. Create comment_reactions table
    await sql(`
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
    await sql(`
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
      `CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)`,
      `CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id)`,
      `CREATE INDEX IF NOT EXISTS idx_games_press_score ON games(press_score)`,
      `CREATE INDEX IF NOT EXISTS idx_games_genre ON games USING GIN(genre)`,
      `CREATE INDEX IF NOT EXISTS idx_games_platform ON games USING GIN(platform)`,
      `CREATE INDEX IF NOT EXISTS idx_game_reviews_game ON game_reviews(game_id)`,
    ];

    for (const idxSql of indexes) {
      await sql(idxSql);
      console.log(`Created index`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
