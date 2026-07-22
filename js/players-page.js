import { computeAllPlayerStats } from './stats.js';
import { getInitials } from './utils.js';
import { setActiveNav, initMobileNav } from './ui.js';

let allStats = [];
let sortKey = 'totalPoints';
let sortDir = 'desc';

function rankBadge(rank) {
  if (rank <= 3) {
    return `<span class="rank-badge-sm rank-${rank}">${rank}</span>`;
  }
  return `<span style="color:var(--text-muted);font-weight:600;font-size:0.75rem">${rank}</span>`;
}

function formatStat(val) {
  if (val > 0) return `<span class="stat-pos">${val}</span>`;
  if (val < 0) return `<span class="stat-neg">${val}</span>`;
  return val;
}

function renderTable() {
  const sorted = [...allStats].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    return sortDir === 'desc' ? vb - va : va - vb;
  });

  document.getElementById('players-tbody').innerHTML = sorted.map((s, i) => {
    const photo = s.player.photo
      ? `<img src="${s.player.photo}" alt="${s.player.name}">`
      : getInitials(s.player.name);

    return `<tr onclick="window.location='player.html?id=${s.player.id}'">
      <td><div style="display:flex;justify-content:center">${rankBadge(i + 1)}</div></td>
      <td class="player-name-cell">
        <div class="player-mini">
          <div class="player-avatar-sm">${photo}</div>
          <a href="player.html?id=${s.player.id}" class="player-name-link">${s.player.name}</a>
        </div>
      </td>
      <td>${s.matchesPlayed}</td>
      <td>${formatStat(s.goals)}</td>
      <td>${formatStat(s.assists)}</td>
      <td>${formatStat(s.saves)}</td>
      <td>${formatStat(s.passes)}</td>
      <td>${formatStat(s.dribbles)}</td>
      <td>${s.yellowCards > 0 ? `<span class="stat-neg">${s.yellowCards}</span>` : s.yellowCards}</td>
      <td>${s.redCards > 0 ? `<span class="stat-neg">${s.redCards}</span>` : s.redCards}</td>
      <td class="pts-cell">${s.totalPoints}</td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.standings-table thead th[data-sort]').forEach(th => {
    const key = th.dataset.sort;
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (key === sortKey) {
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

async function init() {
  setActiveNav('players');
  initMobileNav();

  allStats = await computeAllPlayerStats();
  renderTable();

  document.querySelectorAll('.standings-table thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (key === sortKey) {
        sortDir = sortDir === 'desc' ? 'asc' : 'desc';
      } else {
        sortKey = key;
        sortDir = 'desc';
      }
      renderTable();
    });
  });
}

init();
