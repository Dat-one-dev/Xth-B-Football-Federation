import { getUrlParam, formatDate, eventTypeLabel, eventTypeIcon, eventTypeClass } from './utils.js';
import { getMatchById } from './data.js';
import { setActiveNav, initMobileNav, teamColor } from './ui.js';
import { getData } from './loader.js';

async function init() {
  setActiveNav('matches');
  initMobileNav();

  const matchId = getUrlParam('id');
  if (!matchId) {
    document.getElementById('match-detail').innerHTML = '<p style="text-align:center;padding:3rem">No match specified.</p>';
    return;
  }

  const [match, playersData] = await Promise.all([
    getMatchById(matchId),
    getData('players.json')
  ]);

  if (!match) {
    document.getElementById('match-detail').innerHTML = '<p style="text-align:center;padding:3rem">Match not found.</p>';
    return;
  }

  function getPlayerName(id) {
    const p = playersData.players.find(x => x.id === id);
    return p ? p.name : 'Unknown';
  }

  const colorA = teamColor(match.teamA.name);
  const colorB = teamColor(match.teamB.name);
  const aWins = match.scoreA > match.scoreB;
  const bWins = match.scoreB > match.scoreA;
  const glowStyle = (c, active) => active ? `box-shadow:0 0 24px 4px ${c}40,0 0 0 2px ${c}80` : '';
  const scoreGlow = (c, active) => active ? `color:${c};text-shadow:0 0 20px ${c}60` : '';

  document.getElementById('match-detail').innerHTML = `
    <div class="match-detail-header">
      <div class="${aWins ? 'team-side winner' : 'team-side'}">
        <div class="team-crest-lg" style="background:${colorA}20;color:${colorA};${glowStyle(colorA, aWins)}">${match.teamA.name}</div>
        <div class="team-name" style="font-weight:700;${scoreGlow(colorA, aWins)}">${match.teamA.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Captain: ${getPlayerName(match.teamA.captain)}</div>
      </div>
      <div class="score-center">
        <div class="score-display"><span class="score-value"${aWins ? ` style="${scoreGlow(colorA, aWins)}"` : ''}>${match.scoreA}</span> <span class="score-separator">-</span> <span class="score-value"${bWins ? ` style="${scoreGlow(colorB, bWins)}"` : ''}>${match.scoreB}</span></div>
        <div style="font-size:0.85rem;color:var(--text-secondary)">${formatDate(match.date)}</div>
      ${match.result ? `<div style="margin-top:0.4rem;font-size:0.75rem;font-weight:700;color:var(--success);text-transform:uppercase">${match.result}${match.resultNote ? ' &mdash; ' + match.resultNote : ''}</div>` : ''}
      ${match.officials ? `<div style="margin-top:0.3rem;font-size:0.7rem;color:var(--text-muted)">Officials: ${match.officials.join(', ')}</div>` : ''}
      </div>
      <div class="${bWins ? 'team-side winner' : 'team-side'}">
        <div class="team-crest-lg" style="background:${colorB}20;color:${colorB};${glowStyle(colorB, bWins)}">${match.teamB.name}</div>
        <div class="team-name" style="font-weight:700;${scoreGlow(colorB, bWins)}">${match.teamB.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Captain: ${getPlayerName(match.teamB.captain)}</div>
      </div>
    </div>`;

  const sortedEvents = [...match.events].sort((a, b) => a.order - b.order);

  document.getElementById('match-timeline').innerHTML = sortedEvents.map(evt => {
    const playerName = getPlayerName(evt.player);
    const secondaryName = evt.secondaryPlayer ? getPlayerName(evt.secondaryPlayer) : '';
    const icon = eventTypeIcon(evt.type);
    const label = eventTypeLabel(evt.type);

    let content = `<div class="event-type"><i class="fa-solid ${icon}"></i> ${label}</div><div class="event-player">${playerName}</div>`;
    if (evt.type === 'goal' && secondaryName) {
      content += `<div class="event-secondary">Assist: ${secondaryName}</div>`;
    }

    return `<div class="timeline-item ${eventTypeClass(evt.type)}">
      <div class="timeline-minute">${evt.order}</div>
      <div class="timeline-content">${content}</div>
    </div>`;
  }).join('');

  document.getElementById('teamA-roster-title').innerHTML = `<i class="fa-solid fa-users"></i> ${match.teamA.name} Players`;
  document.getElementById('teamB-roster-title').innerHTML = `<i class="fa-solid fa-users"></i> ${match.teamB.name} Players`;

  function renderRoster(players, color) {
    return players.map(pid => {
      const p = playersData.players.find(x => x.id === pid);
      return p ? `<a href="player.html?id=${pid}" class="roster-player" style="border-color:${color}40;color:inherit;text-decoration:none">${p.name}</a>` : '';
    }).join('');
  }

  document.getElementById('teamA-roster').innerHTML = renderRoster(match.teamA.players, colorA);
  document.getElementById('teamB-roster').innerHTML = renderRoster(match.teamB.players, colorB);
}

init();
