import { buildSystemPrompt, WEB_RESEARCH_TOOL } from "../../../lib/prompt.js";
import { runWebResearch } from "../../../lib/search.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel honors this on Pro; Hobby caps lower)

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const MAX_ROUNDS = 2; // initial research pass + one verification pass

// One DeepSeek call. `withTools` lets the model request a web_research call.
async function deepseekCall(messages, withTools) {
  const payload = { model: MODEL, messages, temperature: 0.2 };
  if (withTools) {
    payload.tools = [WEB_RESEARCH_TOOL];
    payload.tool_choice = "auto";
  }
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`DeepSeek error ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message || {};
}

// Safety net: strip any leaked tool-call special tokens so raw markup
// (e.g. "<｜tool…>", "<｜｜DSML｜｜…>") can never reach the UI as text.
function sanitize(text) {
  if (!text) return "";
  let s = String(text);
  const cut = s.search(/<\s*[｜|]\s*[｜|]?\s*(DSML|tool)/iu);
  if (cut !== -1) s = s.slice(0, cut);
  s = s.replace(/<\s*[｜|][^>]*?[｜|]\s*>/gu, "");
  return s.trim();
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
            text: "DEEPSEEK_API_KEY is not configured. Add it in your hosting environment variables.",
          });
          controller.close();
          return;
        }

        send({ type: "status", text: "Bonaventure dey think small..." });

        const convo = [{ role: "system", content: buildSystemPrompt(mode) }, ...history];

        // --- Agent loop: let the model research as many rounds as it needs (capped). ---
        let finalText = "";
        for (let round = 0; round < MAX_ROUNDS; round++) {
          const msg = await deepseekCall(convo, true);
          const toolCalls = msg.tool_calls || [];

          // No tool call -> this turn IS the answer (or a clarifying question).
          if (!toolCalls.length) {
            finalText = sanitize(msg.content || "");
            break;
          }

          // Otherwise run the requested research and loop again.
          convo.push(msg); // intermediate tool-deciding turn — never shown to the user
          send({
            type: "status",
            text: round === 0 ? "E dey comb the internet now..." : "E dey cross-check the strongest leads...",
          });
          for (const tc of toolCalls) {
            let args = {};
            try {
              args = JSON.parse(tc.function?.arguments || "{}");
            } catch {
              args = {};
            }
            const research = await runWebResearch(
              { queries: args.queries || [], subreddits: args.subreddits || [] },
              (t) => send({ type: "status", text: t })
            );
            convo.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify(research).slice(0, 24000),
            });
          }
        }

        // If the model still wanted to keep searching at the round cap, force a
        // clean final answer using only what's been gathered (no tools available).
        if (!finalText) {
          send({ type: "status", text: "E dey arrange the verified ones for you..." });
          convo.push({
            role: "user",
            content:
              "Do NOT call any tools. Using ONLY the search results already gathered, write your final answer now in the required format. Never invent anything; if results are thin, say so and suggest broadening.",
          });
          const msg = await deepseekCall(convo, false);
          finalText = sanitize(msg.content || "");
        }

        if (!finalText) {
          send({
            type: "error",
            text: "Bonaventure couldn't pull together verified results this time. Try again, or broaden your criteria.",
          });
          controller.close();
          return;
        }

        // Reveal the final answer in clean Markdown blocks (no partial-markup flicker).
        send({ type: "answer_start" });
        const blocks = finalText.split(/\n\n+/);
        if (blocks.length <= 1) {
          send({ type: "token", text: finalText });
        } else {
          for (const b of blocks) {
            if (b.trim()) send({ type: "token", text: b + "\n\n" });
          }
        }
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
