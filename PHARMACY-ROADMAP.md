# StudyBuddy Pharmacy — product roadmap

## Product goal
Extend StudyBuddy into a pharmacist's personal medical-intelligence and long-term knowledge-retention workspace. Keep the existing general study tools and add a pharmacy-focused workspace.

## Phase 1 — Pharmacy learning foundation (implemented in the feature branch)
- `pharmacy.html`: mobile-friendly medical intelligence, topic search, saved items, and active-recall questions.
- `review.js`: browser-local spaced-repetition queue with adaptive review intervals and export/reset controls.
- `daily-feed.js` displays the scheduled PubMed digest when available; live search remains as a fallback.
- Core topics include pharmacokinetics, pharmacodynamics, antimicrobial stewardship, adverse drug reactions, and pharmaceutical calculations.
- Example briefing cards are explicitly marked as illustrative; they must never be mistaken for current alerts.

## Phase 2 — Verified intelligence sources (first slice implemented)
- PubMed live search uses NCBI E-utilities to retrieve research records and links each result to its original PubMed record. The scheduled digest selects recently entered PubMed records; displayed citation/issue dates can be later than online-first publication, so the original record must be checked. Items are research discovery, not clinical recommendations.
- Official links are provided for NAFDAC recalls/safety alerts (Nigeria), WHO medical product alerts (global), FDA drug safety communications (US), and EMA medicine updates (EU). These links are direct source access, not yet automated ingestion; always check the original notice and local applicability.
- `scripts/update-intelligence.js` and `.github/workflows/daily-intelligence.yml` refresh `data/latest-intelligence.json` daily at 07:00 UTC (08:00 WAT) from PubMed E-utilities; the workflow can also be run manually. The digest preserves original links, publication date, retrieval time, jurisdiction, source type and an explicit 'evidence type not assessed' label.
- The scheduled workflow starts running after merge into the default branch. Broader ingestion from WHO/WHO AFRO, FDA, EMA and NAFDAC remains future work.
- Deduplicate notices and preserve the original source. Show last successful refresh and source outages; never fabricate current items.

## Phase 3 — Personal knowledge base
- Curriculum map: pharmacology, pharmacokinetics, pharmacodynamics, therapeutics, pharmaceutics, medicinal chemistry, microbiology, toxicology, clinical pharmacy, calculations, and public health.
- Import user-provided notes and documents; create editable summaries and flashcards with traceable references.
- Add tags, search, bookmarks, personal notes, and export.

## Phase 4 — Adaptive revision
- Implemented browser-local spaced repetition for the five starter lessons: due queue, answer reveal, Again/Hard/Good/Easy grades, adaptive intervals, review/lapse counts, JSON export, and reset.
- Review state currently stays in localStorage on one browser/device; account sync, configurable daily study time, and more curriculum cards remain future work.
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
