# Opportunity Monitor — "Bonaventure Ibe"

A live, on-demand research tool that helps **Nigerian university students** find **real, verified** scholarships, fellowships, internships, competitions and grants — plus honest, practical guidance on **remote jobs & side hustles**.

It is a single **Next.js** app:

- **The designed front page** is the student UI (two-mode picker → quick qualifying form → streamed result cards).
- **A serverless API route** (`/api/research`) holds the Bonaventure system prompt and runs the real research: it calls **DeepSeek** (the reasoning brain) with a live **web-search layer** (**Tavily** + **Reddit** public JSON) so results are grounded in real listings — never invented.

> Why a search layer? DeepSeek has no built-in web access and a fixed knowledge cutoff. On its own it would hallucinate scholarships and deadlines. The app forces DeepSeek to research first and only present items backed by real search results with real URLs.

---

## 1. What you need (both free / near-free)

| Key | What it's for | Where to get it | Cost |
|-----|---------------|-----------------|------|
| `DEEPSEEK_API_KEY` | The reasoning brain | https://platform.deepseek.com → API Keys | Pay-as-you-go, cents-level per search |
| `TAVILY_API_KEY` | Live web search | https://app.tavily.com | Free tier (~1,000 searches/mo) |

Reddit search needs **no key**.

---

## 2. Run it locally (optional)

```bash
npm install
cp .env.example .env.local      # then paste your two keys into .env.local
npm run dev                      # http://localhost:3000
```

Build check:

```bash
npm run build && npm run start
```

---

## 3. Deploy to Vercel (recommended)

1. Push this folder to a **GitHub** repo (see section 5).
2. Go to **vercel.com → Add New → Project** and import the repo.
3. Framework preset auto-detects **Next.js**. Leave build settings as default.
4. Open **Settings → Environment Variables** and add:
   - `DEEPSEEK_API_KEY` = your DeepSeek key
   - `TAVILY_API_KEY` = your Tavily key
5. Click **Deploy**. Done — you get a public `*.vercel.app` URL.

**Timeouts:** research can take 20–60s. Vercel's **Hobby (free)** plan caps serverless functions at 60s, which is usually enough because the response streams. If you see timeouts on heavy searches, upgrade the plan or lower `MAX_SEARCH_QUERIES` (see section 6).

---

## 4. Deploy to Netlify (alternative)

1. Push to GitHub (section 5).
2. **netlify.com → Add new site → Import an existing project.**
3. Build command `npm run build`, publish directory `.next` (already set in `netlify.toml`). Netlify auto-installs the Next.js runtime.
4. **Site settings → Environment variables** → add `DEEPSEEK_API_KEY` and `TAVILY_API_KEY`.
5. Deploy.

> Note: Netlify's free function timeout is short (10s). For long research runs, Vercel is the smoother free option, or use Netlify on a paid plan.

---

## 5. Push to GitHub

```bash
cd opportunity-monitor
git init
git add .
git commit -m "Opportunity Monitor — initial version"
git branch -M main
git remote add origin https://github.com/<you>/opportunity-monitor.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.next`, and **all `.env` files**, so your keys never get committed.

---

## 6. Customising it

| Want to… | Edit |
|----------|------|
| Add/remove sources (sites & subreddits it combs) | `lib/sources.js` |
| Change Bonaventure's behaviour, rules or output format | `lib/prompt.js` |
| Change the design / colours / copy / Pidgin lines | `app/globals.css` and `app/page.jsx` |
| Tune cost vs. depth | env vars below |

Optional env vars (with defaults):

```
DEEPSEEK_MODEL=deepseek-chat
TAVILY_SEARCH_DEPTH=basic     # "basic" = 1 credit/search, "advanced" = 2
MAX_SEARCH_QUERIES=5          # caps Tavily calls per research run
```

---

## 7. How it works (under the hood)

```
Student → picks mode → fills quick form
   → POST /api/research  { mode, messages }
       → DeepSeek decides what to search (function-calling: web_research)
       → Tavily searches the web + Reddit JSON searches subreddits
       → DeepSeek receives REAL results, verifies & formats per the rules
       → streamed back as { status | token | error } events
   → UI renders streamed Markdown into result cards, with a Stop button
```

## 8. The promise to students (baked into the prompt)

- Never fabricates an opportunity, listing, deadline, pay figure, or URL.
- Only presents items supported by real search results, with real links.
- Honest about pay and difficulty; says so and suggests broadening when results are thin.
- Tells students a real scholarship/job never charges a fee to apply.
