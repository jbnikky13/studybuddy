(() => {
  'use strict';
  const KEY = 'studybuddy-pharmacy-spaced-repetition-v1';
  const DAY = 24 * 60 * 60 * 1000;
  const getCards = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  };
  const putCards = cards => localStorage.setItem(KEY, JSON.stringify(cards));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const dueNow = card => !card.dueAt || card.dueAt <= Date.now();
  let currentId = null;
  let revealed = false;

  // Seed a personal review card for each built-in lesson on first visit.
  function seedCards() {
    const cards = getCards();
    ((typeof lessons !== 'undefined') ? lessons : []).forEach((lesson, index) => {
      const id = 'lesson-' + index;
      if (!cards[id]) cards[id] = {
        id, title: lesson.title, question: lesson.q, answers: lesson.a,
        correct: lesson.correct, explanation: lesson.why, repetitions: 0,
        intervalDays: 0, dueAt: Date.now(), reviews: 0, lapses: 0
      };
    });
    putCards(cards);
  }

  function setupUI() {
    const nav = document.querySelector('.nav');
    if (!nav || document.getElementById('reviewTab')) return;
    const button = document.createElement('button');
    button.id = 'reviewTab';
    button.dataset.tab = 'review';
    button.textContent = 'Spaced review';
    button.addEventListener('click', () => window.tab('review'));
    nav.appendChild(button);

    const section = document.createElement('section');
    section.id = 'review';
    section.className = 'hide';
    section.innerHTML = `
      <div class="section-head"><h2>Spaced repetition</h2>
      <p>Review due topics, rate how well you recalled them, and let the next review date adapt.</p></div>
      <div class="grid" id="reviewStats"></div>
      <div class="card" id="reviewCard" style="margin-top:12px"></div>
      <div class="toolbar"><button class="btn" id="exportReviews">Export review data</button>
      <button class="btn" id="resetReviews">Reset review schedule</button></div>
      <p class="meta">Your schedule is saved in this browser on this device. It is not synced across devices or accounts.</p>`;
    document.querySelector('.footer').before(section);
    document.getElementById('exportReviews').addEventListener('click', exportData);
    document.getElementById('resetReviews').addEventListener('click', resetData);

    const originalTab = window.tab;
    window.tab = function(id) {
      if (id !== 'review') return originalTab(id);
      ['briefing','learn','quiz','saved','review'].forEach(name => {
        const el = document.getElementById(name);
        if (el) el.classList.toggle('hide', name !== 'review');
      });
      document.querySelectorAll('[data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === 'review'));
      render();
    };
  }

  function render() {
    const cards = getCards();
    const all = Object.values(cards);
    const due = all.filter(dueNow).sort((a,b) => (a.dueAt || 0) - (b.dueAt || 0));
    const stats = document.getElementById('reviewStats');
    const target = document.getElementById('reviewCard');
    if (!stats || !target) return;
    stats.innerHTML = [
      ['Due now', due.length], ['In your deck', all.length],
      ['Reviews completed', all.reduce((sum,c) => sum + (c.reviews || 0),0)],
      ['Needs practice', all.filter(c => (c.lapses || 0) > 0).length]
    ].map(([label,value]) => '<article class="card"><div class="tag">'+label+'</div><h3>'+value+'</h3></article>').join('');
    if (!due.length) {
      const next = all.filter(c => c.dueAt > Date.now()).sort((a,b)=>a.dueAt-b.dueAt)[0];
      target.innerHTML = '<div class="tag">Review complete</div><h3>Nothing due right now.</h3><p>' +
        (next ? 'Next review: ' + esc(new Date(next.dueAt).toLocaleString()) : 'Your deck is ready.') +
        '</p><button class="btn primary" onclick="window.tab(\'learn\')">Explore more topics</button>';
      currentId = null;
      return;
    }
    const card = due[0];
    currentId = card.id;
    revealed = false;
    target.innerHTML = '<div class="tag">Due review · ' + due.length + ' waiting</div><h3>' +
      esc(card.title) + '</h3><p><strong>' + esc(card.question) + '</strong></p>' +
      '<div class="answers">' + card.answers.map((answer,index) =>
        '<button class="btn answer" data-review-answer="'+index+'">'+esc(answer)+'</button>').join('') +
      '</div><p id="reviewExplanation" style="margin-top:12px;color:var(--muted)"></p>' +
      '<div id="reviewGrades" class="answers hide"><p>How well did you recall this?</p>' +
      '<button class="btn" data-grade="again">Again · forgot</button>' +
      '<button class="btn" data-grade="hard">Hard · struggled</button>' +
      '<button class="btn" data-grade="good">Good · recalled</button>' +
      '<button class="btn" data-grade="easy">Easy · effortless</button></div>' +
      '<p class="meta">Previous reviews: '+(card.reviews||0)+' · Lapses: '+(card.lapses||0)+'</p>';
    target.querySelectorAll('[data-review-answer]').forEach(button =>
      button.addEventListener('click', () => reveal(Number(button.dataset.reviewAnswer), card)));
    target.querySelectorAll('[data-grade]').forEach(button =>
      button.addEventListener('click', () => grade(button.dataset.grade, card)));
  }

  function reveal(answerIndex, card) {
    if (revealed) return;
    revealed = true;
    const correct = answerIndex === card.correct;
    const explanation = document.getElementById('reviewExplanation');
    explanation.textContent = (correct ? 'Correct. ' : 'Not quite. Correct answer: ' + card.answers[card.correct] + '. ') + card.explanation;
    const buttons = document.querySelectorAll('[data-review-answer]');
    buttons.forEach((button,index) => {
      button.disabled = true;
      if (index === card.correct) button.classList.add('correct');
      else if (index === answerIndex) button.classList.add('wrong');
    });
    const grades = document.getElementById('reviewGrades');
    grades.classList.remove('hide');
    if (!correct) {
      const hard = grades.querySelector('[data-grade="hard"]');
      if (hard) hard.textContent = 'Hard · review soon';
    }
  }

  function grade(rating, card) {
    if (!revealed || !currentId) return;
    const cards = getCards();
    const saved = cards[currentId];
    if (!saved) return;
    const now = Date.now();
    saved.reviews = (saved.reviews || 0) + 1;
    if (rating === 'again') {
      saved.repetitions = 0;
      saved.intervalDays = 0;
      saved.dueAt = now + 10 * 60 * 1000;
      saved.lapses = (saved.lapses || 0) + 1;
    } else {
      const previous = saved.intervalDays || 0;
      const multipliers = {hard:1.2, good:2.2, easy:3.2};
      const base = previous === 0 ? (rating === 'easy' ? 4 : rating === 'hard' ? 1 : 2) : Math.max(1, previous * multipliers[rating]);
      saved.intervalDays = Math.min(180, Math.round(base));
      saved.repetitions = (saved.repetitions || 0) + 1;
      saved.dueAt = now + saved.intervalDays * DAY;
      saved.lastRating = rating;
    }
    saved.lastReviewedAt = now;
    cards[currentId] = saved;
    putCards(cards);
    render();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(),cards:getCards()},null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'studybuddy-pharmacy-review.json';
    link.click(); URL.revokeObjectURL(url);
  }
  function resetData() {
    if (!window.confirm('Reset all spaced-repetition progress on this device? This cannot be undone unless you exported a backup.')) return;
    localStorage.removeItem(KEY); seedCards(); render();
  }

  seedCards();
  setupUI();
  window.renderSpacedReview = render;
})();
