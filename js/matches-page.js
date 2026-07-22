import { getData } from './loader.js';
import { formatDate } from './utils.js';
import { setActiveNav, initMobileNav, teamColor } from './ui.js';

async function init() {
  setActiveNav('matches');
  initMobileNav();

  const matchesData = await getData('matches.json');
  const playersData = await getData('players.json');
  const matches = matchesData.matches.sort((a, b) => new Date(b.date) - new Date(a.date));

  function getPlayerName(id) {
    const p = playersData.players.find(x => x.id === id);
    return p ? p.name : id;
  }

  document.getElementById('matches-list').innerHTML = matches.map(m => {
    const colorA = teamColor(m.teamA.name);
    const colorB = teamColor(m.teamB.name);
    const goalsCount = m.events.filter(e => e.type === 'goal').length;

    return `<a href="match.html?id=${m.id}" class="match-card" style="text-decoration:none;color:inherit;display:block">
      <div class="match-date">${formatDate(m.date)}</div>
      <div class="match-teams">
        <div class="team-info">
          <div class="team-crest" style="background:${colorA}20;color:${colorA}">${m.teamA.name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">Captain: ${getPlayerName(m.teamA.captain)}</div>
        </div>
        <div class="match-score">
          <span>${m.scoreA}</span>
          <span class="score-sep">-</span>
          <span>${m.scoreB}</span>
        </div>
        <div class="team-info">
          <div class="team-crest" style="background:${colorB}20;color:${colorB}">${m.teamB.name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">Captain: ${getPlayerName(m.teamB.captain)}</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:0.75rem;font-size:0.8rem;color:var(--text-muted)">${goalsCount} goal${goalsCount !== 1 ? 's' : ''} scored${m.result ? ' &middot; <span style="color:var(--danger);font-weight:700">Draw</span>' : ''}</div>
    </a>`;
  }).join('');
}

init();
