import { getData } from './loader.js';

export async function computePlayerStats(playerId) {
  const [players, matches, scoring] = await Promise.all([
    getData('players.json'),
    getData('matches.json'),
    getData('scoring.json')
  ]);

  const player = players.players.find(p => p.id === playerId);
  if (!player) return null;

  const stats = {
    goals: 0, assists: 0, yellowCards: 0, redCards: 0,
    saves: 0, dribbles: 0, offsides: 0, ownGoals: 0,
    matchesPlayed: 0, totalPoints: 0
  };

  const matchSet = new Set();

  for (const match of matches.matches) {
    const inTeamA = match.teamA.players.includes(playerId);
    const inTeamB = match.teamB.players.includes(playerId);

    if (inTeamA || inTeamB) {
      matchSet.add(match.id);
    }

    for (const evt of match.events) {
      if (evt.player === playerId) {
        const n = evt.count || 1;
        switch (evt.type) {
          case 'goal': stats.goals += n; break;
          case 'assist': stats.assists += n; break;
          case 'yellow': stats.yellowCards += n; break;
          case 'red': stats.redCards += n; break;
          case 'save': stats.saves += n; break;
          case 'dribble': stats.dribbles += n; break;
          case 'offside': stats.offsides += n; break;
          case 'ownGoal': stats.ownGoals += n; break;
        }
      }
    }
  }

  stats.matchesPlayed = matchSet.size;

  stats.totalPoints =
    stats.goals * scoring.goal +
    stats.assists * scoring.assist +
    stats.saves * scoring.save +
    stats.dribbles * scoring.dribble +
    stats.offsides * scoring.offside +
    stats.yellowCards * scoring.yellow +
    stats.redCards * scoring.red +
    stats.ownGoals * scoring.ownGoal;

  return { player, stats };
}

export async function computeAllPlayerStats() {
  const [players, matches, scoring] = await Promise.all([
    getData('players.json'),
    getData('matches.json'),
    getData('scoring.json')
  ]);

  const playerStats = {};

  for (const p of players.players) {
    if (p.id === 'nill') continue;
    playerStats[p.id] = {
      player: p,
      goals: 0, assists: 0, yellowCards: 0, redCards: 0,
      saves: 0, dribbles: 0, offsides: 0, ownGoals: 0,
      matchesPlayed: 0, totalPoints: 0
    };
  }

  const matchCounts = {};

  for (const match of matches.matches) {
    const allPlayers = [...match.teamA.players, ...match.teamB.players];

    for (const pid of allPlayers) {
      if (playerStats[pid]) {
        matchCounts[pid] = (matchCounts[pid] || 0) + 1;
      }
    }

    for (const evt of match.events) {
      if (playerStats[evt.player]) {
        const n = evt.count || 1;
        switch (evt.type) {
          case 'goal': playerStats[evt.player].goals += n; break;
          case 'assist': playerStats[evt.player].assists += n; break;
          case 'yellow': playerStats[evt.player].yellowCards += n; break;
          case 'red': playerStats[evt.player].redCards += n; break;
          case 'save': playerStats[evt.player].saves += n; break;
          case 'dribble': playerStats[evt.player].dribbles += n; break;
          case 'offside': playerStats[evt.player].offsides += n; break;
          case 'ownGoal': playerStats[evt.player].ownGoals += n; break;
        }
      }
    }
  }

  for (const pid of Object.keys(playerStats)) {
    const s = playerStats[pid];
    s.matchesPlayed = matchCounts[pid] || 0;
    s.totalPoints =
      s.goals * scoring.goal +
      s.assists * scoring.assist +
      s.saves * scoring.save +
      s.dribbles * scoring.dribble +
      s.offsides * scoring.offside +
      s.yellowCards * scoring.yellow +
      s.redCards * scoring.red +
      s.ownGoals * scoring.ownGoal;
  }

  return Object.values(playerStats);
}

export async function getLeaderboard() {
  const allStats = await computeAllPlayerStats();
  return allStats.sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function getTopScorers() {
  const allStats = await computeAllPlayerStats();
  return allStats.sort((a, b) => b.goals - a.goals).filter(s => s.goals > 0);
}

export async function getTopAssists() {
  const allStats = await computeAllPlayerStats();
  return allStats.sort((a, b) => b.assists - a.assists).filter(s => s.assists > 0);
}

export async function getTopSavers() {
  const allStats = await computeAllPlayerStats();
  return allStats.sort((a, b) => b.saves - a.saves).filter(s => s.saves > 0);
}

export async function getMostCards() {
  const allStats = await computeAllPlayerStats();
  return allStats
    .map(s => ({ ...s, totalCards: s.yellowCards + s.redCards }))
    .sort((a, b) => b.totalCards - a.totalCards)
    .filter(s => s.totalCards > 0);
}
