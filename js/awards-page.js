import { setActiveNav, initMobileNav, renderRank } from './ui.js';
import { computeAllPlayerStats } from './stats.js';

async function init() {
  setActiveNav('awards');
  initMobileNav();

  const allStats = await computeAllPlayerStats();

  const sorted = [...allStats].sort((a, b) => b.totalPoints - a.totalPoints);
  const byGoals = [...allStats].filter(s => s.goals > 0).sort((a, b) => b.goals - a.goals);
  const byAssists = [...allStats].filter(s => s.assists > 0).sort((a, b) => b.assists - a.assists);
  const bySaves = [...allStats].filter(s => s.saves > 0).sort((a, b) => b.saves - a.saves);
  const fairPlay = [...allStats]
    .filter(s => s.matchesPlayed >= 2)
    .sort((a, b) => a.totalCards - b.totalCards || b.totalPoints - a.totalPoints);

  const awards = [
    { icon: 'fa-trophy', title: 'Golden Boot', winner: byGoals[0], stat: `${byGoals[0]?.goals || 0} goals` },
    { icon: 'fa-paper-plane', title: 'Best Playmaker', winner: byAssists[0], stat: `${byAssists[0]?.assists || 0} assists` },
    { icon: 'fa-shield-halved', title: 'Best Goalkeeper', winner: bySaves[0], stat: `${bySaves[0]?.saves || 0} saves` },
    { icon: 'fa-star', title: 'MVP', winner: sorted[0], stat: `${sorted[0]?.totalPoints || 0} pts` },
    { icon: 'fa-handshake', title: 'Fair Play', winner: fairPlay[0], stat: `${fairPlay[0]?.yellowCards || 0}Y ${fairPlay[0]?.redCards || 0}R` }
  ];

  document.getElementById('awards-content').innerHTML = `
    <div class="grid-3">
      ${awards.map(a => {
        if (!a.winner) return '';
        return `<div class="award-card animate-in">
          <div class="award-icon"><i class="fa-solid ${a.icon}"></i></div>
          <div class="award-title">${a.title}</div>
          <div class="award-winner"><a href="player.html?id=${a.winner.player.id}" style="color:var(--text-primary)">${a.winner.player.name}</a></div>
          <div class="award-stat">${a.stat}</div>
        </div>`;
      }).join('')}
    </div>

    <h3 class="section-title" style="margin-top:2rem">Full Rankings</h3>
    <div class="card">
      <div class="table-wrapper"><table><thead><tr><th>#</th><th>Player</th><th>Points</th><th>Goals</th><th>Assists</th><th>Matches</th></tr></thead><tbody>
      ${sorted.map((s, i) => `<tr>
        <td>${renderRank(i + 1)}</td>
        <td><a href="player.html?id=${s.player.id}">${s.player.name}</a></td>
        <td><strong>${s.totalPoints}</strong></td>
        <td>${s.goals}</td>
        <td>${s.assists}</td>
        <td>${s.matchesPlayed}</td>
      </tr>`).join('')}
      </tbody></table></div>
    </div>`;
}

init();
