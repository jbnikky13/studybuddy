# StudyBuddy Pharmacy — product roadmap

## Product goal
Extend StudyBuddy into a pharmacist's personal medical-intelligence and long-term knowledge-retention workspace. Keep the existing general study tools and add a pharmacy-focused workspace.

## Phase 1 — Pharmacy learning foundation (implemented in the feature branch)
- `pharmacy.html`: mobile-friendly medical intelligence, topic search, saved items, and active-recall questions.
- Core topics include pharmacokinetics, pharmacodynamics, antimicrobial stewardship, adverse drug reactions, and pharmaceutical calculations.
- Example briefing cards are explicitly marked as illustrative; they must never be mistaken for current alerts.

## Phase 2 — Verified intelligence sources (first slice implemented)
- PubMed live search uses NCBI E-utilities to retrieve recent publication records, links each result to its original PubMed record, and labels records as research rather than clinical recommendations.
- A direct link to NAFDAC's official recalls and safety alerts is provided for Nigeria-specific medicine safety notices.
- Next: build scheduled ingestion and persistence for PubMed, WHO/WHO AFRO, FDA, EMA, and NAFDAC; capture canonical source URL, publication date, retrieval date, jurisdiction, source type, and evidence type.
- Deduplicate notices and preserve the original source. Show last successful refresh and source outages; never fabricate current items.

## Phase 3 — Personal knowledge base
- Curriculum map: pharmacology, pharmacokinetics, pharmacodynamics, therapeutics, pharmaceutics, medicinal chemistry, microbiology, toxicology, clinical pharmacy, calculations, and public health.
- Import user-provided notes and documents; create editable summaries and flashcards with traceable references.
- Add tags, search, bookmarks, personal notes, and export.

## Phase 4 — Adaptive revision
- Spaced repetition and active recall tracking correct/incorrect answers and confidence.
- Schedule weak topics and allow a configurable daily study time.
- Keep source material distinct from generated questions; flag uncertain or conflicting explanations.

## Phase 5 — Secure AI study companion (server endpoint scaffold implemented)
- Browser calls same-origin `/api/chat`; provider credentials are only read by the server from `OPENROUTER_API_KEY`.
- Configure `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL` in Vercel Project Settings; set `APP_ORIGIN` to the exact deployed origin (no trailing slash) for origin checks.
- The server applies input length limits and a best-effort per-instance rate guard. This is not a substitute for durable, account-based quotas; add authentication and durable rate limiting before public launch.
- Keep references and dates visible for medical claims. Do not substitute for current clinical guidelines, local protocols, professional judgment, or an official drug-information reference.

## Phase 6 — Personalization and delivery
- Daily digest preferences by topic/source, saved searches, and optional reminder delivery.
- Nigeria-first relevance with international coverage.
- Add authentication, data retention controls, source monitoring, and privacy review before launch.

## Security and deployment notes
- The old frontend contained an exposed provider credential. Rotate/revoke it with the provider; removing it from the current file does not remove it from Git history.
- This app needs a Vercel deployment for `/api/chat`. GitHub Pages alone cannot run the serverless function. Do not configure a public production deployment until the new endpoint and environment variables have been tested.
- Do not commit secrets or `.env` files.

## Acceptance criteria
- No sample card is mistaken for live news.
- Every live intelligence item links to its original source and displays available publication metadata.
- Medical summaries distinguish evidence types and uncertainty.
- Revision history persists across sessions and users can export/delete learning data.
- Provider credentials never ship to the browser.
