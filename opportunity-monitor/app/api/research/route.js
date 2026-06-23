import { buildSystemPrompt, WEB_RESEARCH_TOOL } from "../../../lib/prompt.js";
import { runWebResearch } from "../../../lib/search.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel honors this on Pro; Hobby caps lower)

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

// --- non-streaming DeepSeek call (used for the tool-decision step) ---
async function deepseekDecide(messages, tools) {
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DeepSeek error ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message || {};
}

// --- streaming DeepSeek call (used for the final synthesized answer) ---
async function deepseekStream(messages, onToken) {
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tool_choice: "none",
      temperature: 0.3,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DeepSeek stream error ${res.status}: ${txt.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) onToken(delta);
      } catch {
        /* ignore keep-alive / partial lines */
      }
    }
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }
  const { mode, messages } = body || {};
  const history = Array.isArray(messages) ? messages : [];

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (obj) => {
        try {
          controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
        } catch {
          /* controller already closed (client aborted) */
        }
      };

      try {
        if (!process.env.DEEPSEEK_API_KEY) {
          send({
            type: "error",
            text:
              "DEEPSEEK_API_KEY is not configured. Add it in your hosting environment variables.",
          });
          controller.close();
          return;
        }

        send({ type: "status", text: "Bonaventure dey think small..." });

        const convo = [
          { role: "system", content: buildSystemPrompt(mode) },
          ...history,
        ];

        // Step 1: let the model decide whether to research or ask a question.
        const decision = await deepseekDecide(convo, [WEB_RESEARCH_TOOL]);

        const toolCalls = decision.tool_calls || [];
        if (toolCalls.length === 0) {
          // No research needed (likely a clarifying question). Send its text.
          send({ type: "answer_start" });
          if (decision.content) send({ type: "token", text: decision.content });
          send({ type: "done" });
          controller.close();
          return;
        }

        // Step 2: run the requested research.
        convo.push(decision);
        for (const tc of toolCalls) {
          let args = {};
          try {
            args = JSON.parse(tc.function?.arguments || "{}");
          } catch {
            args = {};
          }
          const research = await runWebResearch(args, (text) =>
            send({ type: "status", text })
          );
          convo.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(research).slice(0, 24000),
          });
        }

        // Step 3: stream the final, synthesized answer.
        send({ type: "status", text: "E dey arrange the verified ones for you..." });
        send({ type: "answer_start" });
        await deepseekStream(convo, (text) => send({ type: "token", text }));
        send({ type: "done" });
        controller.close();
      } catch (err) {
        send({
          type: "error",
          text: (err && err.message) || "Something went wrong during research.",
        });
        try {
          controller.close();
        } catch {
          /* noop */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
