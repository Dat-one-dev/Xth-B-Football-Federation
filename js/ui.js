import { getInitials } from './utils.js';

export function setActiveNav(page) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

export function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) navLinks.classList.remove('open');
    });
  }
}

export function createPlayerCell(player) {
  const cell = document.createElement('div');
  cell.className = 'player-cell';
  const photo = player.photo
    ? `<img src="${player.photo}" alt="${player.name}">`
    : getInitials(player.name);
  cell.innerHTML = `
    <div class="player-avatar">${photo}</div>
    <div>
      <div class="player-name"><a href="player.html?id=${player.id}">${player.name}</a></div>
    </div>`;
  return cell;
}

export function renderRank(rank) {
  if (rank <= 3) {
    const cls = `rank-${rank}`;
    return `<span class="rank-badge ${cls}">${rank}</span>`;
  }
  return `<span class="rank-badge">${rank}</span>`;
}

export function renderStatCards(container, stats) {
  container.innerHTML = stats.map(s => `
    <div class="stat-card animate-in">
      <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');
}

export function renderEmpty(container, message) {
  container.innerHTML = `<div class="loading" style="display:block;text-align:center;padding:3rem;color:var(--text-secondary)">${message}</div>`;
}

export function showLoading(container) {
  container.innerHTML = '<div class="loading">Loading...</div>';
}

export function teamColor(name) {
  const colors = {
    Sholay: '#ef4444',
    Doomsday: '#3b82f6',
    Red: '#ef4444', Blue: '#3b82f6', Green: '#10b981', Yellow: '#f59e0b',
    Orange: '#f97316', Purple: '#8b5cf6', Black: '#374151', White: '#e5e7eb',
    Pink: '#ec4899', Cyan: '#06b6d4'
  };
  return colors[name] || '#6b7280';
}
