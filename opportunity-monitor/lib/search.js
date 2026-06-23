// ============================================================================
// The live "eyes": Tavily web search + Reddit public JSON.
// Both are wrapped so a failure in one source never breaks the whole run.
// ============================================================================

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

async function tavilySearch(query) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const depth = process.env.TAVILY_SEARCH_DEPTH || "basic";
  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: depth,
        max_results: 6,
        include_answer: false,
        include_raw_content: false,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r) => ({
      source: "web",
      title: r.title,
      url: r.url,
      snippet: (r.content || "").slice(0, 500),
      published: r.published_date || null,
    }));
  } catch {
    return [];
  }
}

async function redditSearch(subreddit, query) {
  // Reddit's public JSON needs no key, just a descriptive User-Agent.
  const q = encodeURIComponent(query);
  const url = `https://www.reddit.com/r/${encodeURIComponent(
    subreddit
  )}/search.json?q=${q}&restrict_sr=1&sort=new&limit=6&t=year`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "opportunity-monitor/1.0 (student opportunity finder)" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const children = (data?.data?.children || []).map((c) => c.data);
    return children.map((p) => ({
      source: `reddit:r/${subreddit}`,
      title: p.title,
      url: `https://www.reddit.com${p.permalink}`,
      snippet: (p.selftext || "").slice(0, 400),
      published: p.created_utc
        ? new Date(p.created_utc * 1000).toISOString().slice(0, 10)
        : null,
    }));
  } catch {
    return [];
  }
}

// Runs the model's requested research. `onStatus` lets us stream progress.
export async function runWebResearch({ queries = [], subreddits = [] }, onStatus) {
  const maxQ = parseInt(process.env.MAX_SEARCH_QUERIES || "5", 10);
  const cleanQueries = [...new Set(queries.filter(Boolean))].slice(0, maxQ);
  const cleanSubs = [...new Set(subreddits.filter(Boolean))].slice(0, 4);

  if (onStatus) {
    onStatus(
      `E dey comb the internet now — ${cleanQueries.length} search${
        cleanQueries.length === 1 ? "" : "es"
      }${cleanSubs.length ? ` + ${cleanSubs.length} subreddits` : ""}...`
    );
  }

  const tavilyJobs = cleanQueries.map((q) => tavilySearch(q));
  // Search each subreddit with the first (broadest) query.
  const redditQuery = cleanQueries[0] || "";
  const redditJobs = redditQuery
    ? cleanSubs.map((s) => redditSearch(s, redditQuery))
    : [];

  const settled = await Promise.allSettled([...tavilyJobs, ...redditJobs]);
  let all = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && Array.isArray(s.value)) all = all.concat(s.value);
  }

  // De-duplicate by URL.
  const seen = new Set();
  const deduped = [];
  for (const r of all) {
    if (!r.url || seen.has(r.url)) continue;
    seen.add(r.url);
    deduped.push(r);
  }

  const tavilyConfigured = Boolean(process.env.TAVILY_API_KEY);
  let note = null;
  if (!tavilyConfigured) {
    note =
      "TAVILY_API_KEY is not set, so only Reddit was searched. Set it for full web coverage.";
  } else if (deduped.length === 0) {
    note = "No live results came back for these queries. Suggest the student broadens the criteria.";
  }

  if (onStatus) {
    onStatus(
      deduped.length
        ? `E don see ${deduped.length} real result${
            deduped.length === 1 ? "" : "s"
          } — e dey check wetin still dey open...`
        : "Hmm, nothing solid come back — e go tell you make you broaden the search."
    );
  }

  return {
    count: deduped.length,
    note,
    results: deduped.slice(0, 40),
  };
}
