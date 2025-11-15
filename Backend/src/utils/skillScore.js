// Simple Elo-like skill score update
const updateSkillScore = (winnerScore, loserScore, k = 32) => {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 - expectedWinner;

  const newWinnerScore = Math.round(winnerScore + k * (1 - expectedWinner));
  const newLoserScore = Math.round(loserScore + k * (0 - expectedLoser));

  return { winner: newWinnerScore, loser: newLoserScore };
};

module.exports = { updateSkillScore };