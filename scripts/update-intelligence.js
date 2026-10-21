const fs = require('node:fs/promises');
const path = require('node:path');

const QUERY = '(pharmacology OR pharmacy OR drug safety OR pharmacovigilance OR antimicrobial stewardship)';
const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const OUT = path.join(process.cwd(), 'data', 'latest-intelligence.json');

async function getJson(endpoint, params) {
  const url = new URL(endpoint, BASE);
  url.search = new URLSearchParams({ ...params, tool: 'StudyBuddyPharmacy' }).toString();
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('NCBI request failed with HTTP ' + response.status);
  return response.json();
}

async function main() {
  const search = await getJson('esearch.fcgi', {
    db: 'pubmed', term: QUERY, sort: 'pub_date', retmax: '12', retmode: 'json'
  });
  const ids = search?.esearchresult?.idlist || [];
  let records = [];
  if (ids.length) {
    const summary = await getJson('esummary.fcgi', {
      db: 'pubmed', id: ids.join(','), retmode: 'json'
    });
    const results = summary?.result || {};
    records = ids.map(id => {
      const item = results[id];
      if (!item) return null;
      return {
        id,
        title: String(item.title || 'Untitled PubMed record'),
        journal: String(item.fulljournalname || item.source || ''),
        publicationDate: String(item.pubdate || ''),
        authors: (item.authors || []).slice(0, 3).map(author => String(author.name || '')).filter(Boolean),
        sourceType: 'PubMed bibliographic record',
        evidenceType: 'Not assessed — inspect the original record',
        jurisdiction: 'International research literature',
        sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + encodeURIComponent(id) + '/',
        retrievedAt: new Date().toISOString()
      };
    }).filter(Boolean);
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    query: QUERY,
    source: 'National Library of Medicine PubMed via NCBI E-utilities',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
    recordCount: records.length,
    records,
    notice: 'Research discovery only. Publication records are not verified clinical guidance. Check the original paper, applicable guidelines, and official regulator notices before acting.'
  };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
  console.log('Wrote ' + records.length + ' PubMed records to data/latest-intelligence.json');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
