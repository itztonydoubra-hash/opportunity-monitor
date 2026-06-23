"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

/* ---------- markdown -> sanitized HTML -> cards ---------- */
function renderMarkdown(md) {
  if (typeof window === "undefined" || !md) return "";
  const html = marked.parse(md, { gfm: true, breaks: true });
  let clean = DOMPurify.sanitize(html);
  // open links in a new tab safely
  clean = clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  return clean;
}

function toCards(html, modeClass) {
  if (!html) return "";
  if (!html.includes("<h3")) return `<div class="card plain ${modeClass}">${html}</div>`;
  const parts = html.split(/(?=<h3)/g);
  let out = "";
  for (const p of parts) {
    if (!p.trim()) continue;
    if (p.startsWith("<h3")) out += `<div class="card ${modeClass}">${p}</div>`;
    else out += `<div class="lead">${p}</div>`;
  }
  return out;
}

/* ---------- option data ---------- */
const LEVELS = ["100 level", "200 level", "300 level", "400 level", "500 level", "Postgraduate"];
const OPP_TYPES = ["Scholarship", "Internship", "Fellowship", "Competition", "Grant", "All of the above"];
const WORK_TYPES = [
  "AI automation", "Virtual assistant", "Content writing", "Social media management",
  "Graphic design", "Video editing", "Data entry", "Customer support",
  "Transcription", "Web development", "Research assistant", "SEO", "Prompt engineering",
];
const EXPERIENCE = ["Total beginner", "Some experience", "Intermediate", "Advanced"];

export default function Page() {
  const [view, setView] = useState("home"); // home | chat
  const [sheet, setSheet] = useState(null); // null | "opportunity" | "remote"
  const [mode, setMode] = useState("opportunity");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState("");

  // form state
  const [oForm, setOForm] = useState({ school: "", course: "", level: "", types: [], context: "" });
  const [rForm, setRForm] = useState({ types: [], other: "", experience: "", income: "", constraints: "" });

  const messagesRef = useRef([]);
  const modeRef = useRef("opportunity");
  const abortRef = useRef(null);
  const listRef = useRef(null);

  function setMsgs(updater) {
    setMessages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      messagesRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, status]);

  function appendToAssistant(text) {
    setMsgs((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") {
          copy[i] = { ...copy[i], content: copy[i].content + text };
          break;
        }
      }
      return copy;
    });
  }

  async function runStream(sendMessages) {
    setError(null);
    setLoading(true);
    setStatus("Bonaventure dey gather himself...");
    setMsgs((prev) => [...prev, { role: "assistant", content: "" }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: modeRef.current, messages: sendMessages }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("Network error (" + res.status + ").");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let gotToken = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;
          let ev;
          try { ev = JSON.parse(t); } catch { continue; }
          if (ev.type === "status") setStatus(ev.text);
          else if (ev.type === "token") {
            if (!gotToken) { gotToken = true; setStatus(null); }
            appendToAssistant(ev.text);
          } else if (ev.type === "error") setError(ev.text);
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") appendToAssistant("\n\n_(You stopped the search.)_");
      else setError((err && err.message) || "Something went wrong.");
    } finally {
      setLoading(false);
      setStatus(null);
      abortRef.current = null;
      setMsgs((prev) => {
        if (prev.length && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
  }

  function startSearch(profileText, m) {
    modeRef.current = m;
    setMode(m);
    setView("chat");
    setSheet(null);
    const userMsg = { role: "user", content: profileText };
    setMsgs([userMsg]);
    runStream([userMsg]);
  }

  function submitOpportunity(e) {
    e.preventDefault();
    if (!oForm.school.trim() || !oForm.course.trim() || !oForm.level) return;
    const types = oForm.types.length ? oForm.types.join(", ") : "All of the above";
    const profile =
      `MODE: Opportunity\n` +
      `School: ${oForm.school.trim()}\n` +
      `Course/Department: ${oForm.course.trim()}\n` +
      `Level: ${oForm.level}\n` +
      `Opportunity types wanted: ${types}\n` +
      `Additional context: ${oForm.context.trim() || "None"}`;
    startSearch(profile, "opportunity");
  }

  function submitRemote(e) {
    e.preventDefault();
    const picked = [...rForm.types];
    if (rForm.other.trim()) picked.push(rForm.other.trim());
    if (!picked.length || !rForm.experience) return;
    const profile =
      `MODE: Remote Jobs\n` +
      `Interested in: ${picked.join(", ")}\n` +
      `Experience level: ${rForm.experience}\n` +
      `Monthly income goal (USD): ${rForm.income.trim() || "Not specified"}\n` +
      `Constraints: ${rForm.constraints.trim() || "None"}`;
    startSearch(profile, "remote");
  }

  function sendFollowUp() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const base = messagesRef.current.filter((m) => !(m.role === "assistant" && !m.content));
    const userMsg = { role: "user", content: text };
    const send = [...base, userMsg];
    setMsgs([...base, userMsg]);
    runStream(send);
  }

  function newSearch() {
    if (abortRef.current) abortRef.current.abort();
    setMsgs([]);
    setView("home");
    setError(null);
    setStatus(null);
  }

  function toggle(arr, val) {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  const modeClass = mode === "remote" ? "remote" : "opp";

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <span className="mark">B</span>
          <span>Opportunity&nbsp;Monitor</span>
        </div>
        {view === "home" ? (
          <span className="header-tag">by Bonaventure Ibe</span>
        ) : (
          <div className="header-actions">
            <span className={`mode-badge ${modeClass}`}>
              {mode === "remote" ? "Remote jobs" : "Opportunities"}
            </span>
            <button className="btn btn-ghost" onClick={newSearch}>↺ New search</button>
          </div>
        )}
      </header>

      {view === "home" && (
        <main className="hero">
          <span className="kicker">Naija students — your next level dey here</span>
          <h1 className="hero-title">
            Find scholarships & <span className="hi">remote jobs</span> wey real.
          </h1>
          <p className="hero-sub">
            Bonaventure combs the live web — Opportunity Desk, LinkedIn, scholarship portals,
            Reddit and more — and brings back only the ones he can verify are real and still open.
            No story, no fake links.
          </p>

          <div className="mode-grid">
            <button className="mode-card opp" onClick={() => setSheet("opportunity")}>
              <span className="pill">Opportunity mode</span>
              <span className="icon">🎓</span>
              <h2 className="m-title">Opportunities</h2>
              <p className="m-desc">Scholarships, fellowships, internships, competitions & grants — matched to your school, course and level.</p>
              <span className="cta">Make we find opportunities <span className="arrow">→</span></span>
            </button>

            <button className="mode-card remote" onClick={() => setSheet("remote")}>
              <span className="pill">Remote jobs mode</span>
              <span className="icon">💻</span>
              <h2 className="m-title">Remote Jobs & Side Hustles</h2>
              <p className="m-desc">Real remote work you fit start earning from — with honest pay, the right platforms, and a plan to start from zero.</p>
              <span className="cta">I wan make remote money <span className="arrow">→</span></span>
            </button>
          </div>

          <div className="steps">
            <div className="step">
              <div className="n">01</div>
              <h4>Pick your mode</h4>
              <p>Opportunities, or remote jobs. Answer a few quick questions.</p>
            </div>
            <div className="step">
              <div className="n">02</div>
              <h4>Bonaventure combs the web</h4>
              <p>Live search across Nigerian & global sources, plus Reddit.</p>
            </div>
            <div className="step">
              <div className="n">03</div>
              <h4>Only verified results</h4>
              <p>Real links, real deadlines, honest pay. Nothing made up.</p>
            </div>
          </div>
        </main>
      )}

      {view === "chat" && (
        <div className="chat-wrap">
          <div className="msg-list" ref={listRef}>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div className="msg user" key={i}>
                  <div className="bubble">{m.content}</div>
                </div>
              ) : (
                <div className="msg assistant" key={i}>
                  <div
                    className="assistant-content"
                    dangerouslySetInnerHTML={{ __html: toCards(renderMarkdown(m.content), modeClass) }}
                  />
                </div>
              )
            )}

            {loading && status && (
              <div className="msg assistant">
                <span className="status-pill">
                  <span className="dots"><i /><i /><i /></span>
                  {status}
                </span>
              </div>
            )}

            {error && (
              <div className="msg assistant">
                <div className="error-box">⚠️ {error}</div>
              </div>
            )}
          </div>

          <div className="composer">
            <textarea
              value={input}
              placeholder="Ask anything, or talk make Bonaventure refine the search…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFollowUp(); }
              }}
              rows={1}
            />
            {loading ? (
              <button className="btn btn-ghost icon-btn" title="Stop am" onClick={() => abortRef.current && abortRef.current.abort()}>■</button>
            ) : (
              <button className={`btn ${mode === "remote" ? "btn-remote" : "btn-primary"} icon-btn`} title="Send" onClick={sendFollowUp}>↑</button>
            )}
          </div>
        </div>
      )}

      {/* ---------- Opportunity form ---------- */}
      {sheet === "opportunity" && (
        <div className="backdrop" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <form className="sheet opp" onSubmit={submitOpportunity}>
            <div className="sheet-head">
              <span className="badge">Opportunity mode</span>
              <button type="button" className="x-btn" onClick={() => setSheet(null)}>×</button>
            </div>
            <h2>Tell Bonaventure about you</h2>
            <p className="sheet-sub">Quick questions so e fit find opportunities wey actually fit you.</p>

            <div className="field">
              <label>What school you dey attend? <span className="hint">(required)</span></label>
              <input type="text" value={oForm.school} placeholder="e.g. University of Lagos"
                onChange={(e) => setOForm({ ...oForm, school: e.target.value })} />
            </div>
            <div className="field">
              <label>Course / Department <span className="hint">(required)</span></label>
              <input type="text" value={oForm.course} placeholder="e.g. Computer Science"
                onChange={(e) => setOForm({ ...oForm, course: e.target.value })} />
            </div>
            <div className="field">
              <label>What level you dey? <span className="hint">(required)</span></label>
              <select value={oForm.level} onChange={(e) => setOForm({ ...oForm, level: e.target.value })}>
                <option value="">Select level…</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>What type of opportunity? <span className="hint">(pick any)</span></label>
              <div className="chips">
                {OPP_TYPES.map((t) => (
                  <button type="button" key={t} className="chip"
                    aria-pressed={oForm.types.includes(t)}
                    onClick={() => setOForm({ ...oForm, types: toggle(oForm.types, t) })}>{t}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Anything else? <span className="hint">(interests, location, need stipend, want to travel abroad…)</span></label>
              <textarea value={oForm.context} placeholder="Optional, but e dey help am match you better."
                onChange={(e) => setOForm({ ...oForm, context: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-block"
              disabled={!oForm.school.trim() || !oForm.course.trim() || !oForm.level}>
              Go find opportunities →
            </button>
          </form>
        </div>
      )}

      {/* ---------- Remote jobs form ---------- */}
      {sheet === "remote" && (
        <div className="backdrop" onClick={(e) => e.target === e.currentTarget && setSheet(null)}>
          <form className="sheet remote" onSubmit={submitRemote}>
            <div className="sheet-head">
              <span className="badge">Remote jobs mode</span>
              <button type="button" className="x-btn" onClick={() => setSheet(null)}>×</button>
            </div>
            <h2>Wetin you wan do?</h2>
            <p className="sheet-sub">Tell Bonaventure the work you like, your level and your money goal.</p>

            <div className="field">
              <label>What kind of remote work? <span className="hint">(pick any)</span></label>
              <div className="chips">
                {WORK_TYPES.map((t) => (
                  <button type="button" key={t} className="chip"
                    aria-pressed={rForm.types.includes(t)}
                    onClick={() => setRForm({ ...rForm, types: toggle(rForm.types, t) })}>{t}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Something else? <span className="hint">(type it if e no dey up there)</span></label>
              <input type="text" value={rForm.other} placeholder="e.g. UI/UX design, bookkeeping…"
                onChange={(e) => setRForm({ ...rForm, other: e.target.value })} />
            </div>
            <div className="field">
              <label>Your experience level <span className="hint">(required)</span></label>
              <div className="chips">
                {EXPERIENCE.map((t) => (
                  <button type="button" key={t} className="chip"
                    aria-pressed={rForm.experience === t}
                    onClick={() => setRForm({ ...rForm, experience: t })}>{t}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Monthly income goal (USD) <span className="hint">(optional)</span></label>
              <input type="text" value={rForm.income} placeholder="e.g. $300 / month"
                onChange={(e) => setRForm({ ...rForm, income: e.target.value })} />
            </div>
            <div className="field">
              <label>Any constraints? <span className="hint">(device, internet, hours/day, existing skills)</span></label>
              <textarea value={rForm.constraints} placeholder="Optional — e helps Bonaventure keep it realistic."
                onChange={(e) => setRForm({ ...rForm, constraints: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-remote btn-block"
              disabled={!(rForm.types.length || rForm.other.trim()) || !rForm.experience}>
              Show me remote work →
            </button>
          </form>
        </div>
      )}

      {view === "home" && (
        <footer className="site-footer">
          <strong>Bonaventure only shows opportunities it can verify from live sources.</strong> Always
          confirm details and deadlines on the official website before you apply. A real scholarship or
          job will never ask you to pay to apply — if anybody asks for money, comot.
        </footer>
      )}
    </div>
  );
}
