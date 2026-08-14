import { getData } from './loader.js';
import { computeAllPlayerStats } from './stats.js';
import { getInitials } from './utils.js';
import { setActiveNav, initMobileNav } from './ui.js';

const TEAM_COLORS = [
  { A: '#ef4444', B: '#3b82f6' },
  { A: '#f59e0b', B: '#8b5cf6' },
  { A: '#10b981', B: '#ec4899' },
  { A: '#f43f5e', B: '#6366f1' },
  { A: '#d946ef', B: '#06b6d4' },
  { A: '#f97316', B: '#84cc16' }
];

let selected = new Set();
let allStats = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function powerOf(playerId) {
  const s = allStats.find(x => x.player.id === playerId);
  if (!s) return 0;
  return s.matchesPlayed > 0 ? s.totalPoints / s.matchesPlayed : 0;
}

function makeTeams() {
  const players = [...selected];
  const n = players.length;
  const half = Math.ceil(n / 2);

  const pool = players.map(pid => {
    const base = powerOf(pid);
    const jitter = base * (Math.random() * 0.24 - 0.12);
    return { pid, power: base, draft: base + jitter };
  }).sort((a, b) => b.draft - a.draft);

  const teamA = [];
  const teamB = [];

  pool.forEach((entry, i) => {
    if (i % 4 === 0 || i % 4 === 3) teamA.push(entry);
    else teamB.push(entry);
  });

  while (teamA.length > half) teamB.push(teamA.pop());

  const isKeeper = p => savesPerMatch(p.pid) > 0;
  const keepersA = teamA.filter(isKeeper);
  const keepersB = teamB.filter(isKeeper);
  if (keepersA.length > 1 && keepersB.length === 0) {
    const spare = keepersA.sort((a, b) => savesPerMatch(a.pid) - savesPerMatch(b.pid))[0];
    teamA.splice(teamA.indexOf(spare), 1);
    const swap = teamB.filter(p => !isKeeper(p)).sort((a, b) => b.draft - a.draft)[0];
    if (swap) {
      teamB.splice(teamB.indexOf(swap), 1);
      teamA.push(swap);
      teamB.push(spare);
    } else teamA.push(spare);
  }

  const power = t => t.reduce((s, p) => s + p.power, 0);
  let guard = 0;
  while (guard++ < 40) {
    const pa = power(teamA);
    const pb = power(teamB);
    if (Math.abs(pa - pb) <= Math.max(pa, pb) * 0.08) break;
    let best = null;
    for (const a of teamA) {
      for (const b of teamB) {
        const newDiff = Math.abs((pa - a.power + b.power) - (pb - b.power + a.power));
        const curDiff = Math.abs(pa - pb);
        if (newDiff < curDiff - 0.05 && (!best || newDiff < best.diff)) {
          best = { a, b, diff: newDiff };
        }
      }
    }
    if (!best) break;
    teamA.splice(teamA.indexOf(best.a), 1);
    teamB.splice(teamB.indexOf(best.b), 1);
    teamA.push(best.b);
    teamB.push(best.a);
  }

  const sortByName = arr => arr.sort((a, b) => a.pid.localeCompare(b.pid));
  return {
    teamA: { players: sortByName(teamA), captain: teamA.reduce((x, y) => y.draft > x.draft ? y : x).pid },
    teamB: { players: sortByName(teamB), captain: teamB.reduce((x, y) => y.draft > x.draft ? y : x).pid }
  };
}

function savesPerMatch(pid) {
  const s = allStats.find(x => x.player.id === pid);
  if (!s) return 0;
  return s.matchesPlayed > 0 ? s.saves / s.matchesPlayed : 0;
}

function playerCardHTML(pid) {
  const player = allStats.find(x => x.player.id === pid).player;
  const s = allStats.find(x => x.player.id === pid);
  const photo = player.photo
    ? `<img src="${player.photo}" alt="${player.name}">`
    : getInitials(player.name);
  return `
    <div class="player-avatar">${photo}</div>
    <div>
      <div class="player-name">${player.name}</div>
      <div class="mm-player-sub">${s.totalPoints} pts · ${s.goals} goals</div>
    </div>`;
}

function renderSelector() {
  const container = document.getElementById('mm-players');
  container.innerHTML = allStats.map(s => `
    <div class="mm-player-chip ${selected.has(s.player.id) ? 'selected' : ''}" data-pid="${s.player.id}">
      ${playerCardHTML(s.player.id)}
    </div>`).join('');

  container.querySelectorAll('.mm-player-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const pid = chip.dataset.pid;
      if (selected.has(pid)) selected.delete(pid);
      else selected.add(pid);
      chip.classList.toggle('selected', selected.has(pid));
      updateActions();
    });
  });

  updateActions();
}

function updateActions() {
  const makeBtn = document.getElementById('mm-make');
  const count = document.getElementById('mm-count');
  count.textContent = `${selected.size} selected`;
  makeBtn.disabled = selected.size < 4;
  makeBtn.title = selected.size < 4 ? 'Select at least 4 players' : '';
}

function teamPower(team) {
  return team.players.reduce((sum, p) => sum + p.power, 0);
}

function renderTeams(teams) {
  const palette = TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  const result = document.getElementById('mm-result');
  result.style.display = '';

  const cards = [
    { team: teams.teamA, name: 'Team 1', color: palette.A },
    { team: teams.teamB, name: 'Team 2', color: palette.B }
  ];

  document.getElementById('mm-teams').innerHTML = cards.map(({ team, name, color }) => `
    <div class="mm-team-card" style="border-color:${color}">
      <div class="mm-team-head">
        <span class="team-crest" style="background:${color}20;color:${color}">${name}</span>
        <span class="mm-team-power" style="color:${color}">Power ${teamPower(team).toFixed(1)}</span>
      </div>
      <ul class="mm-team-roster">
        ${team.players.map(p => {
          const player = allStats.find(x => x.player.id === p.pid).player;
          const isCap = p.pid === team.captain;
          return `<li class="${isCap ? 'mm-captain' : ''}">
            ${player.name} ${isCap ? '<i class="fa-solid fa-crown" style="color:#f59e0b" title="Captain"></i>' : ''}
            <span class="mm-roster-power">${p.power.toFixed(1)}</span>
          </li>`;
        }).join('')}
      </ul>
    </div>`).join('');

  const powerA = teamPower(teams.teamA);
  const powerB = teamPower(teams.teamB);
  const diff = Math.abs(powerA - powerB).toFixed(1);
  const fair = diff <= Math.max(powerA, powerB) * 0.12;
  document.getElementById('mm-fairness-note').innerHTML =
    `<i class="fa-solid ${fair ? 'fa-circle-check' : 'fa-circle-info'}" style="color:${fair ? 'var(--success)' : 'var(--accent-amber)'}"></i> ` +
    `Team powers: ${powerA.toFixed(1)} vs ${powerB.toFixed(1)} &mdash; difference ${diff} ` +
    `(${fair ? 'fairly balanced' : 'try rolling again'}).`;
}

async function init() {
  setActiveNav('matchmaker');
  initMobileNav();

  allStats = await computeAllPlayerStats();
  renderSelector();

  document.getElementById('mm-make').addEventListener('click', () => {
    renderTeams(makeTeams());
    document.getElementById('mm-result').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('mm-reroll').addEventListener('click', () => {
    renderTeams(makeTeams());
  });

  document.getElementById('mm-reset').addEventListener('click', () => {
    selected.clear();
    renderSelector();
    document.getElementById('mm-result').style.display = 'none';
  });
}

init();