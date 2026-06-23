// ============================================================================
// Curated source list. This is the "where to look" knowledge baked into the
// monitor. It is intentionally easy to extend — add a domain or a subreddit
// and the agent will start combing it.
// ============================================================================

// --- OPPORTUNITY MODE: high-signal scholarship / fellowship / grant sources ---
export const OPPORTUNITY_DOMAINS = [
  // Nigerian-first
  "opportunitydesk.org",
  "opportunitiesforafricans.com",
  "afterschoolafrica.com",
  "tonyelumelufoundation.org",
  "mastercardfdnscholars.org",
  "thefutureawardsafrica.org",
  "leapafrica.org",
  "budgit.org",
  "scholarship.gov.ng",
  "nigeriascholarshipboard.com",
  // International
  "scholars4dev.com",
  "daad.de",
  "chevening.org",
  "fulbrightonline.org",
  "akdn.org",
  "fordfoundation.org",
  "idealist.org",
  "unv.org",
  "opportunitydesk.org",
  "scholarshipregion.com",
];

export const OPPORTUNITY_SUBREDDITS = [
  "scholarships",
  "GradSchool",
  "Nigeria",
  "fellowships",
  "studyAbroad",
];

// --- REMOTE JOBS MODE: freelance + remote-work marketplaces ---
export const REMOTE_DOMAINS = [
  "upwork.com",
  "fiverr.com",
  "toptal.com",
  "contra.com",
  "peopleperhour.com",
  "freelancer.com",
  "linkedin.com",
  "remote.co",
  "weworkremotely.com",
  "remoteok.com",
  "wellfound.com",
];

export const REMOTE_SUBREDDITS = [
  "forhire",
  "WorkOnline",
  "freelance",
  "remotework",
  "digitalnomad",
];

// Human-readable lists used inside the system prompt so the model knows the
// landscape even before it searches.
export const OPPORTUNITY_SOURCE_TEXT = `Nigerian-specific: Opportunity Desk, Opportunities For Africans, AfterSchoolAfrica, Tony Elumelu Foundation, Mastercard Foundation Scholars, The Future Awards Africa, LEAP Africa, BudgIT Fellowship, and Nigerian government scholarship portals (scholarship.gov.ng). International: Scholars4Dev, DAAD, Chevening, Fulbright, Aga Khan Foundation, Ford Foundation, Idealist, UN Volunteers. Also LinkedIn for internships, and relevant subreddits (r/scholarships, r/GradSchool, r/Nigeria).`;

export const REMOTE_SOURCE_TEXT = `Freelance & remote marketplaces: Upwork, Fiverr, Toptal, Contra, PeoplePerHour, Freelancer.com, LinkedIn, Remote.co, We Work Remotely, RemoteOK. Plus active subreddits (r/forhire, r/WorkOnline, r/freelance, r/remotework).`;
