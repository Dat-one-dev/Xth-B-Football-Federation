import { getData } from './loader.js';

export async function getPlayerById(playerId) {
  const data = await getData('players.json');
  return data.players.find(p => p.id === playerId);
}

export async function getAllPlayers() {
  const data = await getData('players.json');
  return data.players;
}

export async function getMatchById(matchId) {
  const data = await getData('matches.json');
  return data.matches.find(m => m.id === matchId);
}

export async function getAllMatches() {
  const data = await getData('matches.json');
  return data.matches.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getMatchesForPlayer(playerId) {
  const data = await getData('matches.json');
  return data.matches
    .filter(m => m.events.some(e => e.player === playerId || e.secondaryPlayer === playerId)
      || m.teamA.players.includes(playerId)
      || m.teamB.players.includes(playerId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getScoringRules() {
  return getData('scoring.json');
}
