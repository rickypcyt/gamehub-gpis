-- Fix slugs with leading slash
-- This removes the leading '/' from all slugs in news_posts and blog_posts

UPDATE news_posts SET slug = substring(slug, 2) WHERE slug LIKE '/%';
UPDATE blog_posts SET slug = substring(slug, 2) WHERE slug LIKE '/%';
