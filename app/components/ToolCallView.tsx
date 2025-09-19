"use client";

import { ToolAnswerForm } from "./ToolAnswerForm";

export function ToolCallView({ part, onAnswer }: { part: any; onAnswer?: (answer: string) => void | Promise<void> }) {
  if (!part || typeof part.type !== 'string' || !part.type.startsWith('tool-')) return null;
  const toolName = part.type.slice('tool-'.length);
  const state = (part as any).state as string | undefined;
  const input = (part as any).input as unknown;
  const output = (part as any).output ?? (part as any).result;

  if (toolName === 'ask_for_input') {
    const callId = (part as any).toolCallId as string;
    if (state === 'input-streaming') return <div>Asking a question…</div>;
    if (state === 'input-available') {
      const prompt = (part as any)?.input?.prompt ?? "";
      return (
        <div className="space-y-2">
          <div className="text-sm opacity-80">{prompt}</div>
          {onAnswer ? (
            <ToolAnswerForm onSubmit={(answer) => onAnswer(answer)} />
          ) : null}
        </div>
      );
    }
    if (state === 'output-available') return <div className="text-sm opacity-80">Received your answer.</div>;
    if (state === 'output-error') return <div className="text-sm text-red-500">{(part as any).errorText}</div>;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mt-2">
      <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
        Tool: {toolName}
        {state ? <span className="ml-2 opacity-80">({state})</span> : null}
      </div>
      {state === 'input-available' && input !== undefined && (
        <div className="text-xs text-blue-900 dark:text-blue-100 mb-2">
          <div className="font-medium opacity-80">Input</div>
          <pre className="whitespace-pre-wrap break-words text-[11px] leading-snug">{JSON.stringify(input, null, 2)}</pre>
        </div>
      )}
      {state === 'output-available' && output !== undefined && (
        <div className="text-xs text-blue-900 dark:text-blue-100">
          <div className="font-medium opacity-80">Output</div>
          <pre className="whitespace-pre-wrap break-words text-[11px] leading-snug">{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
      {state === 'output-error' && (
        <div className="text-xs text-red-600">{(part as any).errorText}</div>
      )}
      {state === 'input-streaming' && (
        <div className="text-xs text-blue-800 dark:text-blue-200">Preparing tool call…</div>
      )}
    </div>
  );
}


