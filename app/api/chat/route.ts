import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: "You are a concise and helpful AI assistant.",
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request or server error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}


