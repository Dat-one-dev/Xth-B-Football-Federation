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

  document.getElementById('match-detail').innerHTML = `
    <div class="match-detail-header">
      <div class="team-side">
        <div class="team-crest-lg" style="background:${colorA}20;color:${colorA}">${match.teamA.name}</div>
        <div style="font-weight:700">${match.teamA.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">Captain: ${getPlayerName(match.teamA.captain)}</div>
      </div>
      <div class="score-center">
        <div class="score-display">${match.scoreA} <span class="score-separator">-</span> ${match.scoreB}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary)">${formatDate(match.date)}</div>
      ${match.result ? `<div style="margin-top:0.4rem;font-size:0.75rem;font-weight:700;color:var(--danger);text-transform:uppercase">Draw &mdash; ${match.resultNote || ''}</div>` : ''}
      ${match.officials ? `<div style="margin-top:0.3rem;font-size:0.7rem;color:var(--text-muted)">Officials: ${match.officials.join(', ')}</div>` : ''}
      </div>
      <div class="team-side">
        <div class="team-crest-lg" style="background:${colorB}20;color:${colorB}">${match.teamB.name}</div>
        <div style="font-weight:700">${match.teamB.name}</div>
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

  function renderRoster(players, color) {
    return players.map(pid => {
      const p = playersData.players.find(x => x.id === pid);
      return p ? `<span class="roster-player" style="border-color:${color}40">${p.name}</span>` : '';
    }).join('');
  }

  document.getElementById('teamA-roster').innerHTML = renderRoster(match.teamA.players, colorA);
  document.getElementById('teamB-roster').innerHTML = renderRoster(match.teamB.players, colorB);
}

init();
