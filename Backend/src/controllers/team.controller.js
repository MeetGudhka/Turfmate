const asyncHandler = require('express-async-handler');
const teamService = require('../services/teamService');

const createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const team = await teamService.createTeam(req.user.id, name);
  res.status(201).json(team);
});

module.exports = { createTeam };