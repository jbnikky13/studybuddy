# StudyBuddy Pharmacy — product roadmap

## Product goal
Extend StudyBuddy into a pharmacist's personal medical-intelligence and long-term knowledge-retention workspace. Build on the existing mobile-first StudyBuddy rather than replacing its general study tools.

## Phase 1 — Safe pharmacy learning foundation
- Add a pharmacy-focused workspace with daily briefing, knowledge refresh, recall quiz, and saved items.
- Clearly label sample/demo content; do not present static cards as current news.
- Keep learning interactions lightweight and mobile-friendly.
- Do not use the client-side AI credential currently present in the existing `index.html`. Revoke/rotate it and proxy model requests through a server-side endpoint with secrets stored only in deployment environment variables.

## Phase 2 — Verified intelligence feeds
- Ingest WHO and WHO AFRO updates, PubMed search results, EMA news/regulatory feeds, FDA safety notices, and NAFDAC notices.
- Store title, canonical source URL, source organization, publication date, retrieved date, jurisdiction, category, study/evidence type, and summary.
- Deduplicate items, preserve original links, and distinguish research findings from regulatory decisions and clinical guidance.
- Show source outages and last-successful-refresh timestamps; never fabricate fresh items.

## Phase 3 — Personal knowledge base
- Pharmacy curriculum map: pharmacology, pharmacokinetics, pharmacodynamics, therapeutics, pharmaceutics, medicinal chemistry, microbiology, toxicology, clinical pharmacy, calculations, and public health.
- Import user-provided notes and documents; create editable summaries and flashcards with traceable references.
- Add tags, search, bookmarks, and personal notes.

## Phase 4 — Adaptive revision
- Use spaced repetition and active recall, tracking correct/incorrect answers and confidence.
- Schedule weak topics and let the user adjust daily study time.
- Keep source material and generated questions distinct; flag uncertain or conflicting explanations for review.

## Phase 5 — AI study companion
- Explain topics at beginner, student, and practicing-pharmacist levels.
- Support critical appraisal, drug-class comparisons, mechanism-of-action explanations, and case-based learning.
- Cite evidence for medical claims and show publication dates. Do not substitute for clinical guidelines, local protocols, professional judgment, or an official drug-information reference.

## Phase 6 — Personalization and delivery
- Daily digest settings by topic and source, saved searches, and optional reminder delivery.
- Nigeria-first relevance with international coverage.
- Review privacy, authentication, data retention, API quotas, and deployment security before launch.

## Acceptance criteria
- No sample card is mistaken for live news.
- Every live intelligence item links to its original source and displays dates.
- Medical summaries distinguish evidence types and uncertainty.
- Revision history persists across sessions and the user can export/delete their learning data.
- AI secrets never ship to the browser.
