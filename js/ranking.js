import { computeAllPlayerStats } from './stats.js';

export async function getRankings() {
  const allStats = await computeAllPlayerStats();
  return allStats
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export async function getPlayerRank(playerId) {
  const rankings = await getRankings();
  const idx = rankings.findIndex(r => r.player.id === playerId);
  return idx >= 0 ? rankings[idx].rank : null;
}
