import { setActiveNav, initMobileNav, renderRank } from './ui.js';
import { computeAllPlayerStats } from './stats.js';

async function init() {
  setActiveNav('stats');
  initMobileNav();

  const allStats = await computeAllPlayerStats();

  function renderCategory(title, iconName, data, statKey, suffix) {
    if (data.length === 0) return '';
    const top = data[0];
    return `<div class="card">
      <div class="card-header"><h2><i class="fa-solid ${iconName}"></i> ${title}</h2></div>
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <div class="player-avatar" style="width:48px;height:48px;font-size:1rem">${top.player.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div><div style="font-weight:700">${top.player.name}</div></div>
        <div style="margin-left:auto;font-size:1.5rem;font-weight:800;color:var(--accent-blue)">${top[statKey]}${suffix || ''}</div>
      </div>
      <div class="table-wrapper"><table><thead><tr><th>#</th><th>Player</th><th>${title}</th></tr></thead><tbody>
      ${data.slice(0, 5).map((s, i) => `<tr>
        <td>${renderRank(i + 1)}</td>
        <td><a href="player.html?id=${s.player.id}">${s.player.name}</a></td>
        <td><strong>${s[statKey]}${suffix || ''}</strong></td>
      </tr>`).join('')}
      </tbody></table></div></div>`;
  }

  const sorted = {
    scorers: [...allStats].filter(s => s.goals > 0).sort((a, b) => b.goals - a.goals),
    assists: [...allStats].filter(s => s.assists > 0).sort((a, b) => b.assists - a.assists),
    saves: [...allStats].filter(s => s.saves > 0).sort((a, b) => b.saves - a.saves),
    dribbles: [...allStats].filter(s => s.dribbles > 0).sort((a, b) => b.dribbles - a.dribbles),
    offsides: [...allStats].filter(s => s.offsides > 0).sort((a, b) => b.offsides - a.offsides),
    cards: [...allStats].filter(s => s.yellowCards > 0 || s.redCards > 0).sort((a, b) => { const tA = a.yellowCards + a.redCards; const tB = b.yellowCards + b.redCards; if (tB !== tA) return tB - tA; return b.redCards - a.redCards; }).map(s => ({ ...s, totalCards: s.yellowCards + s.redCards })),
    ownGoals: [...allStats].filter(s => s.ownGoals > 0).sort((a, b) => b.ownGoals - a.ownGoals),
    points: [...allStats].sort((a, b) => b.totalPoints - a.totalPoints)
  };

  document.getElementById('stats-content').innerHTML = `
    <div class="grid-2">
      ${renderCategory('Top Scorer', 'fa-futbol', sorted.scorers, 'goals')}
      ${renderCategory('Top Assists', 'fa-paper-plane', sorted.assists, 'assists')}
    </div>
    <div class="grid-2">
      ${renderCategory('Most Saves', 'fa-shield-halved', sorted.saves, 'saves')}
    </div>
    <div class="grid-2">
      ${renderCategory('Most Dribbles', 'fa-arrows-left-right', sorted.dribbles, 'dribbles')}
      ${renderCategory('Most Offsides', 'fa-flag', sorted.offsides, 'offsides')}
    </div>
    <div class="grid-2">
      ${renderCategory('Most Cards', 'fa-square', sorted.cards, 'totalCards')}
    </div>
    <div class="grid-2">
      ${renderCategory('Own Goals', 'fa-triangle-exclamation', sorted.ownGoals, 'ownGoals')}
      ${renderCategory('Highest Rated', 'fa-trophy', sorted.points, 'totalPoints', ' pts')}
    </div>`;
}

init();
