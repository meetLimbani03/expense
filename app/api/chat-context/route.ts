import { NextRequest } from "next/server";
import { convertToModelMessages, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const embeddingsPath = path.join(process.cwd(), "data", "category-embeddings.json");
    let categoryData: Array<{ name: string; description: string }> = [];
    try {
      const raw = await fs.readFile(embeddingsPath, "utf-8");
      categoryData = JSON.parse(raw);
    } catch {
      categoryData = [];
    }

    const userQuery = messages?.[messages.length - 1]?.parts?.map((p: any) => p.text || "").join(" ") || "";

    // Score categories by simple text overlap
    const scores = categoryData.map((cat) => ({
      name: cat.name,
      description: cat.description,
      score: textSimilarity(userQuery.toLowerCase(), `${cat.name} ${cat.description}`.toLowerCase()),
    }));
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, 5);

    // Get subcategories from live categories API
    const categoriesResponse = await fetch(`${req.nextUrl.origin}/api/categories`);
    const categoriesMap: Record<string, { subcategories: string[]; description: string }> = categoriesResponse.ok
      ? await categoriesResponse.json()
      : {};

    const contextLines = top.map((t, idx) => {
      const subs = categoriesMap[t.name]?.subcategories ?? [];
      return `${idx + 1}. ${t.name} — ${t.description}\n   Subcategories: ${subs.join(", ")}`;
    });

    const nowIso = new Date().toISOString();
    const system =
      `You are an expense extraction agent. Current time ISO: ${nowIso}.\n` +
      `Consider only these candidate categories unless none clearly match:\n` +
      contextLines.join("\n") +
      `\n\nExtract: amount (required numeric), category (enum), subcategory (valid for chosen category), original text, concise description, and ISO time based on the user's wording and current time. ` +
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
    console.error("Chat-Context API error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request or server error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

function textSimilarity(query: string, text: string): number {
  const queryWords = query.split(/\s+/).filter((word) => word.length > 2);
  const textWords = text.split(/\s+/);
  let matches = 0;
  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(queryWords.length, 1);
}


