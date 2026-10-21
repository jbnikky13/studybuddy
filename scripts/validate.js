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
new vm.Script(fs.readFileSync('review.js', 'utf8'), { filename: 'review.js' });

if (main.includes('sk-or-v1-')) throw new Error('index.html must not contain a provider API key');
if (!main.includes("fetch('/api/chat'")) throw new Error('index.html must use the server-side /api/chat endpoint');
if (!pharmacy.includes('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')) throw new Error('Live PubMed search endpoint is missing');
if (!pharmacy.includes('https://nafdac.gov.ng/category/recalls-and-alerts/')) throw new Error('Official NAFDAC safety-alert link is missing');
if (!pharmacy.includes('review.js')) throw new Error('Spaced-repetition module is not loaded');
if (!fs.readFileSync('review.js', 'utf8').includes('studybuddy-pharmacy-spaced-repetition-v1')) throw new Error('Spaced-repetition persistence is missing');

console.log('StudyBuddy validation passed: inline JavaScript parses, AI key is not in the frontend, secure AI endpoint is referenced, and PubMed/NAFDAC sources are wired.');
