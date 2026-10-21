const fs = require('node:fs');
const vm = require('node:vm');

function checkInlineScripts(file) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) throw new Error(file + ': no inline script found');
  scripts.forEach((match, index) => new vm.Script(match[1], { filename: file + ':inline-script-' + (index + 1) }));
  return html;
}

const main = checkInlineScripts('index.html');
const pharmacy = checkInlineScripts('pharmacy.html');
new vm.Script(fs.readFileSync('api/chat.js', 'utf8'), { filename: 'api/chat.js' });
new vm.Script(fs.readFileSync('sw.js', 'utf8'), { filename: 'sw.js' });
new vm.Script(fs.readFileSync('review.js', 'utf8'), { filename: 'review.js' });
new vm.Script(fs.readFileSync('daily-feed.js', 'utf8'), { filename: 'daily-feed.js' });
new vm.Script(fs.readFileSync('scripts/update-intelligence.js', 'utf8'), { filename: 'scripts/update-intelligence.js' });

if (main.includes('sk-or-v1-')) throw new Error('index.html must not contain a provider API key');
if (!main.includes("fetch('/api/chat'")) throw new Error('index.html must use the server-side /api/chat endpoint');
if (!pharmacy.includes('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')) throw new Error('Live PubMed search endpoint is missing');
if (!pharmacy.includes('https://nafdac.gov.ng/our-services/pharmacovigilance-post-market-surveillance/recalls-safety-alerts/')) throw new Error('Official NAFDAC safety-alert link is missing');
if (!pharmacy.includes('https://www.who.int/teams/regulation-prequalification/incidents-and-SF/full-list-of-who-medical-product-alerts')) throw new Error('Official WHO medical product alerts link is missing');
if (!pharmacy.includes('https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications')) throw new Error('Official FDA safety communications link is missing');
if (!pharmacy.includes('https://www.ema.europa.eu/en/news-events/whats-new')) throw new Error('Official EMA updates link is missing');
if (!pharmacy.includes('review.js')) throw new Error('Spaced-repetition module is not loaded');
if (!pharmacy.includes('daily-feed.js')) throw new Error('Daily intelligence feed is not loaded');
if (!fs.readFileSync('review.js', 'utf8').includes('studybuddy-pharmacy-spaced-repetition-v1')) throw new Error('Spaced-repetition persistence is missing');
const digestWorkflow = fs.readFileSync('.github/workflows/daily-intelligence.yml', 'utf8');
if (!digestWorkflow.includes('group: studybuddy-pharmacy-digest') || !digestWorkflow.includes('git fetch origin main') || !digestWorkflow.includes('git reset --hard origin/main')) throw new Error('Digest workflow must serialize runs and recover from concurrent main updates');
const serviceWorker = fs.readFileSync('sw.js', 'utf8');
if (!serviceWorker.includes("requestUrl.pathname.endsWith('/data/latest-intelligence.json')") || !serviceWorker.includes('fetch(event.request).then(response =>')) throw new Error('Daily digest must use network-first service-worker caching');
const ingestion = fs.readFileSync('scripts/update-intelligence.js', 'utf8');
if (!ingestion.includes("datetype: 'edat'") || !ingestion.includes('mindate: minDate') || !ingestion.includes('maxdate: maxDate')) throw new Error('PubMed digest must constrain results to recently entered records');
if (!ingestion.includes('indexDateWindow')) throw new Error('PubMed digest must expose its PubMed entry-date window');
if (!ingestion.includes('electronic publication details')) throw new Error('PubMed digest must explain citation-date caveats');

console.log('StudyBuddy validation passed: inline JavaScript parses, AI key is not in the frontend, secure AI endpoint is referenced, and PubMed/NAFDAC sources are wired.');
