(() => {
  'use strict';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  async function loadDigest() {
    const pubmedCard = document.getElementById('pubmedSearch')?.closest('.card');
    if (!pubmedCard || document.getElementById('dailyDigest')) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'dailyDigest';
    card.style.marginBottom = '12px';
    card.innerHTML = '<div class="tag">Daily digest · automated source refresh</div><h3>Latest pharmacy research records</h3><p class="meta" id="digestStatus">Loading the latest scheduled digest…</p><div class="grid" id="digestFeed"></div><p class="meta">Research discovery only. Publication type and evidence quality are not automatically appraised.</p>';
    pubmedCard.before(card);
    const status = document.getElementById('digestStatus');
    const feed = document.getElementById('digestFeed');
    try {
      const response = await fetch('./data/latest-intelligence.json', {cache:'no-store'});
      if (!response.ok) throw new Error('Digest is not available');
      const digest = await response.json();
      const records = Array.isArray(digest.records) ? digest.records : [];
      if (!records.length) {
        status.textContent = 'No records in the scheduled digest yet. Use live PubMed search below.';
        return;
      }
      feed.innerHTML = records.map(item => '<article class="card"><div class="tag">PubMed · '+escapeHTML(item.sourceType || 'Research record')+'</div><h3>'+escapeHTML(item.title)+'</h3><p>'+escapeHTML([item.journal,item.publicationDate].filter(Boolean).join(' · '))+'</p><p>'+escapeHTML((item.authors || []).join(', '))+'</p><div class="meta">Evidence type: '+escapeHTML(item.evidenceType || 'Not assessed')+'<br>Jurisdiction: '+escapeHTML(item.jurisdiction || 'International literature')+'</div><a class="btn" href="'+escapeHTML(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read original record ↗</a></article>').join('');
      const refreshed = digest.generatedAt ? new Date(digest.generatedAt).toLocaleString() : 'time unavailable';
      status.textContent = records.length+' records · Last scheduled refresh: '+refreshed;
    } catch {
      status.textContent = 'Scheduled digest is not available right now. The live PubMed search below may still work.';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadDigest);
  else loadDigest();
})();
