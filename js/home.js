import { getData } from './loader.js';
import { formatDate } from './utils.js';
import { getLeaderboard, computeAllPlayerStats } from './stats.js';
import { setActiveNav, initMobileNav, renderRank, teamColor } from './ui.js';

async function init() {
  setActiveNav('home');
  initMobileNav();

  const [leaderboard, allStats, matchesData] = await Promise.all([
    getLeaderboard(),
    computeAllPlayerStats(),
    getData('matches.json')
  ]);

  const matches = matchesData.matches.sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalGoals = allStats.reduce((s, p) => s + p.goals, 0);
  const totalMatches = matches.length;
  const topScorer = [...allStats].sort((a, b) => b.goals - a.goals)[0];

  document.getElementById('overview-stats').innerHTML = [
    { icon: 'fa-futbol', value: totalGoals, label: 'Goals Scored' },
    { icon: 'fa-calendar', value: totalMatches, label: 'Matches Played' },
    { icon: 'fa-users', value: allStats.length, label: 'Players' },
    { icon: 'fa-trophy', value: topScorer ? topScorer.player.name.split(' ')[0] : '-', label: 'Top Scorer' }
  ].map(s => `
    <div class="stat-card animate-in">
      <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  document.getElementById('leaderboard-body').innerHTML = leaderboard.slice(0, 5).map((p, i) => `
    <tr>
      <td>${renderRank(i + 1)}</td>
      <td><a href="player.html?id=${p.player.id}">${p.player.name}</a></td>
      <td><strong>${p.totalPoints}</strong></td>
      <td>${p.goals}</td>
      <td>${p.assists}</td>
    </tr>`).join('');

  document.getElementById('recent-matches').innerHTML = matches.slice(0, 4).map(m => {
    const colorA = teamColor(m.teamA.name);
    const colorB = teamColor(m.teamB.name);
    return `<a href="match.html?id=${m.id}" class="match-card" style="text-decoration:none;color:inherit">
      <div class="match-date">${formatDate(m.date)}</div>
      <div class="match-teams">
        <div class="team-info">
          <div class="team-crest" style="background:${colorA}20;color:${colorA}">${m.teamA.name}</div>
        </div>
        <div class="match-score">
          <span>${m.scoreA}</span>
          <span class="score-sep">-</span>
          <span>${m.scoreB}</span>
        </div>
        <div class="team-info">
          <div class="team-crest" style="background:${colorB}20;color:${colorB}">${m.teamB.name}</div>
        </div>
      </div>
    </a>`;
  }).join('');
}

init();
