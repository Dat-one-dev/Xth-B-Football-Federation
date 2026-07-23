export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function eventTypeLabel(type) {
  const map = {
    goal: 'Goal',
    assist: 'Assist',
    yellow: 'Yellow Card',
    red: 'Red Card',
    save: 'Save',
    dribble: 'Dribble',
    offside: 'Offside',
    ownGoal: 'Own Goal'
  };
  return map[type] || type;
}

export function eventTypeIcon(type) {
  const map = {
    goal: 'fa-futbol',
    assist: 'fa-paper-plane',
    yellow: 'fa-square',
    red: 'fa-square',
    save: 'fa-shield-halved',
    dribble: 'fa-arrows-left-right',
    offside: 'fa-flag',
    ownGoal: 'fa-triangle-exclamation'
  };
  return map[type] || 'fa-circle';
}

export function eventTypeClass(type) {
  return type || '';
}

export function statIcon(stat) {
  const map = {
    totalPoints: 'fa-trophy',
    goals: 'fa-futbol',
    assists: 'fa-paper-plane',
    saves: 'fa-shield-halved',
    dribbles: 'fa-arrows-left-right',
    offsides: 'fa-flag',
    yellowCards: 'fa-square',
    redCards: 'fa-square',
    ownGoals: 'fa-triangle-exclamation',
    matchesPlayed: 'fa-calendar'
  };
  return map[stat] || 'fa-circle';
}
