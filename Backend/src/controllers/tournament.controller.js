const asyncHandler = require('express-async-handler');
const tournamentService = require('../services/tournamentService');

const createTournament = asyncHandler(async (req, res) => {
  const { name, turfId, startDate, endDate, entryFee, prizePool } = req.body;
  const tournament = await tournamentService.createTournament(name, turfId, startDate, endDate, entryFee, prizePool);
  res.status(201).json(tournament);
});

module.exports = { createTournament };