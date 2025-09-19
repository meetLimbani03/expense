"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { ToolCallView } from "./ToolCallView";

type ApiOption = {
  label: string;
  value: string; // path
};

const API_OPTIONS: ApiOption[] = [
  { label: "Tools (original)", value: "/api/chat" },
  { label: "Text Similarity (context)", value: "/api/chat-context" },
  { label: "Embeddings (context)", value: "/api/chat-embeddings" },
];

const SUGGESTIONS: string[] = [
  "Summarize this receipt: Lunch at Bistro $18.40, Coffee $4.20, Tip $3.00",
  "Categorize: Uber $23.50 on 05/02, Netflix $15.99 on 05/03",
  "What are the top 3 categories from these expenses?",
  "Extract merchant and total from: Walmart Supercenter 100 Main St $82.15",
];

export function ChatPanel() {
  const [apiPath, setApiPath] = useState<string>("/api/chat-embeddings");
  const { messages, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({ api: apiPath }),
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || status !== "ready") return;
    sendMessage({ text: v });
    setInput("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">API</span>
          <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            {API_OPTIONS.map((opt) => {
              const active = apiPath === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setApiPath(opt.value)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition ${
                    active
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className={`inline-block h-2 w-2 rounded-full ${status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>{status === 'ready' ? 'Ready' : 'Working…'}</span>
        </div>
      </div>

      <div className="h-[600px] overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">Ask me to extract expenses from your text.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage({ text: s })}
                  className="text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role !== 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">AI</div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') return <span key={index}>{part.text}</span>;
                    return (
                      <ToolCallView
                        key={index}
                        part={part}
                        onAnswer={async (answer) => {
                          const callId = (part as any).toolCallId as string;
                          await addToolResult({ tool: 'ask_for_input', toolCallId: callId, output: { answer } });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold">You</div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}


