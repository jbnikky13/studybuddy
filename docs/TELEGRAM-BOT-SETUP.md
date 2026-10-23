# StudyBuddy Pharmacy Telegram Game

## Features
- /start and /help: game menu
- /quiz or /play: multiple-choice pharmacy question
- /learn: quick revision card
- /news or /daily: recent PubMed records from StudyBuddy's digest
- /stats: XP, level, streak, answers and accuracy
- /topics: curriculum map
- Correct answers earn 10 XP; attempts earn 2 XP
- Progress is stored in Supabase. Telegram webhook calls are checked using a secret-token header.
- Question bank includes case-based therapeutics, medicine safety, emergency red flags, renal dosing, monitoring, calculations and core pharmacology.
- The bot records each learner's answered question IDs in `telegram_question_attempts` and prioritizes unseen questions until the bank is exhausted.
- `clinical.html` syncs seen-question history and quiz results to a private Supabase table when opened inside Telegram; browser-local storage remains as an offline fallback. The Mini App uses Telegram's signed `initData` verified server-side, not a user ID supplied by the browser.

## Setup
1. In Telegram, use the official @BotFather account and send /newbot. Save the token privately; never commit it to GitHub.
2. Run `sql/telegram-game.sql` and `sql/clinical-progress.sql` in the intended Supabase project's SQL Editor. The second migration creates the private Mini App progress table.
3. Deploy this repository to Vercel or another Node serverless host. GitHub Pages cannot run this webhook.
4. Set these server-only environment variables: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Never expose the service-role key in browser code.
5. After deploying a test environment, register the webhook. Replace placeholders and keep both token and secret private:

    curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
      -H "Content-Type: application/json" \
      -d '{"url":"https://YOUR-DEPLOYMENT.vercel.app/api/telegram-webhook","secret_token":"YOUR_TELEGRAM_WEBHOOK_SECRET","allowed_updates":["message","callback_query"]}'

6. Test `/start`, unseen-question selection, answer scoring, `/stats`, duplicate button taps and `/news` before inviting users. Also open the Mini App from Telegram, answer a case, close/reopen it, and verify the progress is restored. If the SQL migration has not run, sync will fall back to browser-local progress.
7. After deploying the updated code, open `https://YOUR-DEPLOYMENT.vercel.app/clinical.html` in a browser. Configure the bot's Main Mini App through @BotFather if you want an Open App button on the profile. The bot's menu button points to the current Vercel production URL and should be changed if that domain changes.

## Safety and limits
This is a learning game, not diagnosis or treatment advice. PubMed items are research discovery, not appraised clinical guidance. Check original papers, official NAFDAC notices and local protocols. Do not ask users to submit identifiable patient information. Mixed-topic quizzes are the first version; topic-specific rounds, daily challenges, badges, leaderboards and reminders can follow. For a large audience, move scoring into a database transaction and add durable abuse controls.
