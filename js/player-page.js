import { getUrlParam, formatDate, getInitials } from './utils.js';
import { getMatchesForPlayer } from './data.js';
import { computePlayerStats, computeAllPlayerStats } from './stats.js';
import { getPlayerRank } from './ranking.js';
import { setActiveNav, initMobileNav, teamColor } from './ui.js';

function rankClass(rank) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'other';
}

function rankLabel(rank) {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

function statColor(key) {
  if (key === 'yellowCards' || key === 'redCards') return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  if (key === 'goals' || key === 'assists' || key === 'saves') return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  if (key === 'totalPoints') return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
  return { color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.05)' };
}

async function init() {
  setActiveNav('players');
  initMobileNav();

  const playerId = getUrlParam('id');
  if (!playerId) {
    document.getElementById('player-hero').innerHTML = '<p style="text-align:center;padding:3rem">No player specified.</p>';
    return;
  }

  const [result, rank, matches, allStats] = await Promise.all([
    computePlayerStats(playerId),
    getPlayerRank(playerId),
    getMatchesForPlayer(playerId),
    computeAllPlayerStats()
  ]);

  if (!result) {
    document.getElementById('player-hero').innerHTML = '<p style="text-align:center;padding:3rem">Player not found.</p>';
    return;
  }

  const { player, stats } = result;
  const photo = player.photo
    ? `<img src="${player.photo}" alt="${player.name}">`
    : getInitials(player.name);

  const maxVals = {};
  const statKeys = ['goals', 'assists', 'saves', 'passes', 'dribbles', 'yellowCards', 'redCards', 'totalPoints'];
  for (const k of statKeys) {
    maxVals[k] = Math.max(...allStats.map(s => s[k]), 1);
  }

  document.getElementById('player-hero').innerHTML = `
    <div class="player-hero">
      <div class="player-hero-photo">${photo}</div>
      <div class="player-hero-info">
        <h1>${player.name}</h1>
        <div class="player-hero-meta">
          <span><i class="fa-solid fa-calendar"></i> ${stats.matchesPlayed} match${stats.matchesPlayed !== 1 ? 'es' : ''}</span>
          <span><i class="fa-solid fa-trophy" style="color:${rank === 1 ? 'var(--gold)' : rank === 2 ? 'var(--silver)' : rank === 3 ? 'var(--bronze)' : 'var(--text-muted)'}"></i> ${stats.totalPoints} pts</span>
        </div>
        <span class="player-hero-rank ${rankClass(rank)}"><i class="fa-solid fa-ranking-star"></i> Rank #${rankLabel(rank)}</span>
      </div>
    </div>`;

  document.getElementById('player-mini-stats').innerHTML = `
    <div class="player-stat-mini-grid">
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-trophy"></i></div>
        <div class="psm-value">${stats.totalPoints}</div>
        <div class="psm-label">Points</div>
      </div>
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-futbol"></i></div>
        <div class="psm-value">${stats.goals}</div>
        <div class="psm-label">Goals</div>
      </div>
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-paper-plane"></i></div>
        <div class="psm-value">${stats.assists}</div>
        <div class="psm-label">Assists</div>
      </div>
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <div class="psm-value">${stats.saves}</div>
        <div class="psm-label">Saves</div>
      </div>
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-forward"></i></div>
        <div class="psm-value">${stats.passes}</div>
        <div class="psm-label">Passes</div>
      </div>
      <div class="player-stat-mini">
        <div class="psm-icon"><i class="fa-solid fa-arrows-left-right"></i></div>
        <div class="psm-value">${stats.dribbles}</div>
        <div class="psm-label">Dribbles</div>
      </div>
    </div>`;

  const barStats = [
    { key: 'totalPoints', label: 'Total Points', icon: 'fa-trophy' },
    { key: 'goals', label: 'Goals', icon: 'fa-futbol' },
    { key: 'assists', label: 'Assists', icon: 'fa-paper-plane' },
    { key: 'saves', label: 'Saves', icon: 'fa-shield-halved' },
    { key: 'passes', label: 'Passes', icon: 'fa-forward' },
    { key: 'dribbles', label: 'Dribbles', icon: 'fa-arrows-left-right' },
    { key: 'yellowCards', label: 'Yellow Cards', icon: 'fa-square' },
    { key: 'redCards', label: 'Red Cards', icon: 'fa-square' },
  ];

  document.getElementById('player-stat-bars').innerHTML = `
    <div class="stat-bars-section">
      <div class="stat-bars-title"><i class="fa-solid fa-chart-simple"></i> Season Stats</div>
      ${barStats.map(({ key, label, icon }) => {
        const val = stats[key];
        const pct = Math.min((val / maxVals[key]) * 100, 100);
        const c = statColor(key);
        return `<div class="stat-bar-item">
          <div class="stat-bar-label"><i class="fa-solid ${icon}" style="width:16px;color:${c.color}"></i> ${label}</div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${pct}%;background:${c.color}"></div>
          </div>
          <div class="stat-bar-value" style="color:${c.color}">${val}</div>
        </div>`;
      }).join('')}
    </div>`;

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
    if (goals > 0) extra += `<span style="color:var(--success)"><i class="fa-solid fa-futbol"></i> ${goals} </span>`;
    if (assists > 0) extra += `<span style="color:var(--accent-blue)"><i class="fa-solid fa-paper-plane"></i> ${assists}</span>`;

    const isTeamA = m.teamA.players.includes(playerId);
    const teamName = isTeamA ? m.teamA.name : m.teamB.name;
    const teamColorVal = isTeamA ? colorA : colorB;

    return `<a href="match.html?id=${m.id}" class="match-card" style="text-decoration:none;color:inherit;display:block">
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
      <div style="text-align:center;margin-top:0.5rem;font-size:0.75rem">
        <span style="color:var(--text-muted)">Played for </span>
        <span style="color:${teamColorVal};font-weight:600">${teamName}</span>
        ${extra ? `<span style="margin-left:0.5rem;display:inline-flex;gap:0.4rem">${extra}</span>` : ''}
      </div>
    </a>`;
  }).join('');
}

init();
