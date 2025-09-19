import { NextRequest } from "next/server";
import { convertToModelMessages, streamText, embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    // Load category embeddings
    const embeddingsPath = path.join(process.cwd(), "data", "category-embeddings.json");
    let categoryData: Array<{ name: string; description: string; embedding?: number[] }> = [];
    try {
      const raw = await fs.readFile(embeddingsPath, "utf-8");
      categoryData = JSON.parse(raw);
    } catch {
      categoryData = [];
    }

    const userQuery = messages?.[messages.length - 1]?.parts?.map((p: any) => p.text || "").join(" ") || "";

    let topCategories: Array<{ name: string; description: string; subcategories: string[] }> = [];

    if (categoryData.length > 0 && userQuery) {
      // Generate embedding for user query
      const queryEmbedding = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: userQuery,
      });

      // Calculate similarity scores
      const scoredCategories = categoryData.map((cat) => {
        if (!cat.embedding) return { ...cat, score: 0 };

        const similarity = cosineSimilarity(queryEmbedding.embedding, cat.embedding);
        return { ...cat, score: similarity };
      });

      scoredCategories.sort((a, b) => b.score - a.score);
      const top = scoredCategories.slice(0, 5);

      // Get subcategories for top categories
      const categoriesResponse = await fetch(`${req.nextUrl.origin}/api/categories`);
      const categoriesMap: Record<string, { subcategories: string[]; description: string }> = categoriesResponse.ok
        ? await categoriesResponse.json()
        : {};

      topCategories = top.map((cat) => ({
        name: cat.name,
        description: cat.description,
        subcategories: categoriesMap[cat.name]?.subcategories ?? [],
      }));

      console.log("🔍 User query for embeddings:", userQuery);
      console.log("🎯 Top categories by embedding similarity:", top.map(c => `${c.name} (${c.score.toFixed(3)})`));
    }

    // Build context from top categories
    const contextLines = topCategories.map((cat, idx) => {
      return `${idx + 1}. ${cat.name} — ${cat.description}\n   Subcategories: ${cat.subcategories.join(", ")}`;
    });

    const nowIso = new Date().toISOString();
    const system =
      `You are an expense extraction agent. Current time ISO: ${nowIso}.\n` +
      (contextLines.length > 0
        ? `Consider only these candidate categories based on semantic similarity:\n${contextLines.join("\n")}\n\n`
        : "Extract expenses from any category.\n\n"
      ) +
      `Extract: amount (required numeric), category (enum), subcategory (valid for chosen category), original text, concise description, and ISO time based on the user's wording and current time. ` +
      `If required fields are missing or ambiguous, ask a short follow-up question. ` +
      `Respond with a concise explanation and the final structured object.`;

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system,
      messages: convertToModelMessages(messages),
      // No tools here; everything is in context
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat-Embeddings API error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request or server error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
