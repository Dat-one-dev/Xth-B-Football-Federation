import { computeAllPlayerStats } from './stats.js';
import { getInitials } from './utils.js';
import { setActiveNav, initMobileNav, renderRank } from './ui.js';

async function init() {
  setActiveNav('players');
  initMobileNav();

  const allStats = await computeAllPlayerStats();

  document.getElementById('players-grid').innerHTML = allStats
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => {
      const photo = s.player.photo
        ? `<img src="${s.player.photo}" alt="${s.player.name}">`
        : getInitials(s.player.name);
      return `<a href="player.html?id=${s.player.id}" class="card player-card" style="text-decoration:none;color:inherit">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
          <div class="player-avatar" style="width:56px;height:56px;font-size:1.2rem">${photo}</div>
          <div>
            <div style="font-weight:700;font-size:1rem">${s.player.name}</div>
          </div>
          <div style="margin-left:auto">${renderRank(i + 1)}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center">
          <div><div style="font-weight:700;color:var(--accent-blue)">${s.totalPoints}</div><div style="font-size:0.7rem;color:var(--text-muted)">PTS</div></div>
          <div><div style="font-weight:700">${s.goals}</div><div style="font-size:0.7rem;color:var(--text-muted)">Goals</div></div>
          <div><div style="font-weight:700">${s.assists}</div><div style="font-size:0.7rem;color:var(--text-muted)">Assists</div></div>
          <div><div style="font-weight:700">${s.matchesPlayed}</div><div style="font-size:0.7rem;color:var(--text-muted)">Matches</div></div>
        </div>
      </a>`;
    }).join('');
}

init();
