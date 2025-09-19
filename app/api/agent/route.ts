import { NextRequest } from "next/server";
import { Experimental_Agent as Agent, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  console.log(messages);
  const agent = new Agent({
    model: google("gemini-2.5-flash"),
    tools: {
        get_current_time: tool({
            description: "Get the current time",
            inputSchema: z.object({}),
            execute: async () => {
                return {
                    time: new Date().toISOString(),
                };
            },
        }),
    },
  });
  return new Response("Hello, world!");
}