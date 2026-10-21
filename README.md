# StudyBuddy

StudyBuddy is a mobile-first AI study assistant. The Pharmacy Hub adds pharmacy-school revision and medical research discovery.

## Pharmacy Hub
Open `pharmacy.html` from the app, or use the **Pharmacy Hub** link in the main top bar. It includes:
- Live PubMed search and a daily digest of recently indexed records through NCBI E-utilities. PubMed citation/issue dates may be later than online-first publication; open the original record to check electronic publication details.
- Official medicine-safety links for NAFDAC (Nigeria), WHO (global), FDA (US), and EMA (EU). These are direct source links, not all automated feeds.
- Pharmacy topic refresh, active-recall questions, and saved learning items.
- Clearly labelled sample briefing cards; these are not current medical alerts.

PubMed records are research references, not automatically clinical recommendations. Always inspect the original paper and current applicable guidance.

## Telegram Pharmacy Game
A Telegram learning game is being added in `api/telegram-webhook.js`, with setup instructions in `docs/TELEGRAM-BOT-SETUP.md` and the Supabase player schema in `sql/telegram-game.sql`. It requires a Telegram bot token and server-side Supabase credentials in a deployed serverless environment; it is not active until configured and a webhook is registered.

## AI endpoint and deployment
The main app sends AI requests to the same-origin `/api/chat` serverless endpoint. GitHub Pages is static hosting and cannot run this endpoint. Deploy the repository to Vercel to use the AI proxy.

In Vercel Project Settings → Environment Variables, configure:
- `OPENROUTER_API_KEY` — a newly rotated provider key, stored only server-side.
- `OPENROUTER_MODEL` — optional model override; defaults to the current configured model in `api/chat.js`.
- `APP_ORIGIN` — optional exact deployed origin, e.g. `https://your-project.vercel.app`, with no trailing slash.

Then redeploy after saving environment variables. Test a Preview deployment before promoting to Production.

## Important credential warning
An older commit of `index.html` contained a provider API key. Rotate/revoke that credential with OpenRouter immediately. Removing it from the latest source does not erase it from Git history. Never commit API keys, tokens, or `.env` files.

The current API's in-memory rate guard is best-effort and is not sufficient as the only protection for a public app. Add authentication and durable rate limiting before broad public use.

## Local validation
Requires Node.js 20+:
```sh
node scripts/validate.js
```

GitHub Actions runs the same static validation on pull requests.
