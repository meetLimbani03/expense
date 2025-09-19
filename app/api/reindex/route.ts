import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embedMany } from "ai";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Get current categories
    const categoriesResponse = await fetch(`${req.nextUrl.origin}/api/categories`);
    if (!categoriesResponse.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories: Record<string, { subcategories: string[]; description: string }> = await categoriesResponse.json();

    // Ensure data dir for storing embeddings JSON
    const dataDir = path.join(process.cwd(), "data");
    try { await fs.access(dataDir); } catch { await fs.mkdir(dataDir, { recursive: true }); }

      // Use the descriptions from the categories data

    // Generate embeddings for all categories
    const names = Object.keys(categories);
    const texts = names.map((name) => `Category: ${name}. ${categories[name].description}`);

    // Generate actual embeddings using Google Generative AI
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    console.log("🔄 Generating embeddings for", names.length, "categories...");
    const embeddings = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: texts,
    });

    // Store embeddings with category data
    const out = names.map((name, idx) => ({
      name,
      description: categories[name].description,
      embedding: embeddings.embeddings[idx],
    }));

    await fs.writeFile(path.join(dataDir, "category-embeddings.json"), JSON.stringify(out, null, 2), "utf-8");
    console.log("✅ Embeddings generated and stored for", names.length, "categories");

    return Response.json({
      message: "Reindexing completed successfully",
      categoriesIndexed: names.length
    });
  } catch (error) {
    console.error("Reindex error:", error);
    return Response.json(
      { error: "Failed to reindex categories" },
      { status: 500 }
    );
  }
}
