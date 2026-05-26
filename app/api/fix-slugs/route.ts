import { query } from "@/lib/neon";
import { NextResponse } from "next/server";

// Temporary endpoint to fix slugs with leading slash
// Visit /api/fix-slugs to execute
export async function GET() {
  try {
    // Fix news_posts
    const newsResult = await query(
      "UPDATE news_posts SET slug = substring(slug, 2) WHERE slug LIKE '/%' RETURNING slug"
    );

    // Fix blog_posts
    const blogResult = await query(
      "UPDATE blog_posts SET slug = substring(slug, 2) WHERE slug LIKE '/%' RETURNING slug"
    );

    return NextResponse.json({
      success: true,
      message: "Slugs fixed successfully",
      newsFixed: newsResult?.length || 0,
      blogFixed: blogResult?.length || 0,
    });
  } catch (error) {
    console.error("Error fixing slugs:", error);
    return NextResponse.json(
      { error: "Error fixing slugs", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
