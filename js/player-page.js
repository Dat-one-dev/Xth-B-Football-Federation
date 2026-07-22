import { getUrlParam, formatDate, getInitials } from './utils.js';
import { getMatchesForPlayer } from './data.js';
import { computePlayerStats } from './stats.js';
import { getPlayerRank } from './ranking.js';
import { setActiveNav, initMobileNav, teamColor } from './ui.js';

async function init() {
  setActiveNav('players');
  initMobileNav();

  const playerId = getUrlParam('id');
  if (!playerId) {
    document.getElementById('player-profile').innerHTML = '<p style="text-align:center;padding:3rem">No player specified.</p>';
    return;
  }

  const [result, rank, matches] = await Promise.all([
    computePlayerStats(playerId),
    getPlayerRank(playerId),
    getMatchesForPlayer(playerId)
  ]);

  if (!result) {
    document.getElementById('player-profile').innerHTML = '<p style="text-align:center;padding:3rem">Player not found.</p>';
    return;
  }

  const { player, stats } = result;
  const photo = player.photo
    ? `<img src="${player.photo}" alt="${player.name}">`
    : getInitials(player.name);

  document.getElementById('player-profile').innerHTML = `
    <div class="profile-photo">${photo}</div>
    <div class="profile-info">
      <h1>${player.name}</h1>
      <div class="profile-meta">
        <span><i class="fa-solid fa-ranking-star"></i> Rank: #${rank}</span>
        <span><i class="fa-solid fa-calendar"></i> ${stats.matchesPlayed} Matches</span>
      </div>
    </div>`;

  document.getElementById('player-stats').innerHTML = [
    { icon: 'fa-trophy', value: stats.totalPoints, label: 'Total Points' },
    { icon: 'fa-futbol', value: stats.goals, label: 'Goals' },
    { icon: 'fa-paper-plane', value: stats.assists, label: 'Assists' },
    { icon: 'fa-shield-halved', value: stats.saves, label: 'Saves' },
    { icon: 'fa-arrow-right-long', value: stats.passes, label: 'Passes' },
    { icon: 'fa-arrows-left-right', value: stats.dribbles, label: 'Dribbles' },
    { icon: 'fa-square', value: stats.yellowCards, label: 'Yellow Cards' },
    { icon: 'fa-square', value: stats.redCards, label: 'Red Cards' }
  ].map(s => `
    <div class="stat-card animate-in">
      <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  const matchesContainer = document.getElementById('player-matches');
  if (matches.length === 0) {
    matchesContainer.innerHTML = '<p style="color:var(--text-secondary);padding:1rem">No matches yet.</p>';
    return;
  }

  matchesContainer.innerHTML = matches.map(m => {
    const colorA = teamColor(m.teamA.name);
    const colorB = teamColor(m.teamB.name);
    const playerEvents = m.events.filter(e => e.player === playerId || e.secondaryPlayer === playerId);
    const goals = playerEvents.filter(e => e.type === 'goal').length;
    const assists = playerEvents.filter(e => e.type === 'assist').length;

    let extra = '';
    if (goals > 0) extra += `<i class="fa-solid fa-futbol"></i> ${goals} `;
    if (assists > 0) extra += `<i class="fa-solid fa-paper-plane"></i> ${assists}`;

    const isTeamA = m.teamA.players.includes(playerId);
    const teamName = isTeamA ? m.teamA.name : m.teamB.name;
    const teamColorVal = isTeamA ? colorA : colorB;

    return `<a href="match.html?id=${m.id}" class="match-card" style="text-decoration:none;color:inherit;display:block">
      <div class="match-date">${formatDate(m.date)}</div>
      <div class="match-teams">
        <div class="team-info">
          <div class="team-crest" style="background:${colorA}20;color:${colorA}">${m.teamA.name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">Captain: ${m.teamA.captain}</div>
        </div>
        <div class="match-score">
          <span>${m.scoreA}</span>
          <span class="score-sep">-</span>
          <span>${m.scoreB}</span>
        </div>
        <div class="team-info">
          <div class="team-crest" style="background:${colorB}20;color:${colorB}">${m.teamB.name}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">Captain: ${m.teamB.captain}</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:0.5rem;font-size:0.75rem">
        <span style="color:var(--text-muted)">Played for </span>
        <span style="color:${teamColorVal};font-weight:600">${teamName}</span>
        ${extra ? `<span style="margin-left:0.5rem;color:var(--accent-blue)">${extra}</span>` : ''}
      </div>
    </a>`;
  }).join('');
}

init();
