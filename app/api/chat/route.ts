import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Experimental_Agent as Agent, tool } from "ai";
import { z } from "zod";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const agent = new Agent({
      tools: [tool({
        name: "get_current_time",
        description: "Get the current time",
        parameters: z.object({}),
      })],
    });

    const result = await agent.stream({
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


