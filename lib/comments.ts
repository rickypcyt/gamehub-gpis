import { query, queryOne } from "@/lib/neon";

export type CommentPostType = "news" | "blog";

let ensureCommentsSchemaPromise: Promise<void> | null = null;

export async function ensureCommentsSchema() {
  if (!ensureCommentsSchemaPromise) {
    ensureCommentsSchemaPromise = (async () => {
      await query("ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id TEXT");
      await query("ALTER TABLE comments ADD COLUMN IF NOT EXISTS post_type TEXT");
      await query("UPDATE comments SET post_type = 'blog' WHERE post_type IS NULL");
      await query("ALTER TABLE comments ALTER COLUMN post_type SET DEFAULT 'blog'");
      await query("ALTER TABLE comments ALTER COLUMN post_type SET NOT NULL");
      await query("ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey");
      await query("CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)");
      await query("CREATE INDEX IF NOT EXISTS idx_comments_post_type ON comments(post_type)");

      await query(`
        CREATE TABLE IF NOT EXISTS comment_reactions (
          id TEXT PRIMARY KEY,
          comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      await query("CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id)");
      await query("CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id)");
    })().catch((error) => {
      ensureCommentsSchemaPromise = null;
      console.error("Error ensuring comments schema:", error);
      throw error;
    });
  }

  return ensureCommentsSchemaPromise;
}

export async function resolvePostType(postId: string): Promise<CommentPostType | null> {
  const newsPost = await queryOne("SELECT id FROM news_posts WHERE id = $1", [postId]);
  if (newsPost) return "news";

  const blogPost = await queryOne("SELECT id FROM blog_posts WHERE id = $1", [postId]);
  if (blogPost) return "blog";

  return null;
}
