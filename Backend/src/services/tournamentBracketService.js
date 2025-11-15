const db = require('../config/db');

// Tournament Brackets and Scheduling
const generateBrackets = async (tournamentId) => {
    const teams = await db.query(
        'SELECT * FROM tournament_teams WHERE tournament_id = $1 ORDER BY RANDOM()',
        [tournamentId]
    );

    const rounds = Math.ceil(Math.log2(teams.rows.length));
    const totalTeams = Math.pow(2, rounds);
    const byes = totalTeams - teams.rows.length;

    // Create matches
    const matches = [];
    let matchIndex = 0;
    for (let i = 0; i < teams.rows.length; i += 2) {
        const team1 = teams.rows[i];
        const team2 = i + 1 < teams.rows.length ? teams.rows[i + 1] : null;

        matches.push({
            tournament_id: tournamentId,
            round: 1,
            match_number: matchIndex + 1,
            team1_id: team1.team_id,
            team2_id: team2?.team_id || null,
            status: team2 ? 'pending' : 'team1_advanced'
        });
        matchIndex++;
    }

    // Insert matches into database
    for (const match of matches) {
        await db.query(
            `INSERT INTO tournament_matches 
             (tournament_id, round, match_number, team1_id, team2_id, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [match.tournament_id, match.round, match.match_number,
             match.team1_id, match.team2_id, match.status]
        );
    }

    return matches;
};

const updateMatchScore = async (matchId, team1Score, team2Score) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Update match score
        const match = await client.query(
            `UPDATE tournament_matches 
             SET team1_score = $1, team2_score = $2, 
                 status = 'completed',
                 winner_id = CASE WHEN $1 > $2 THEN team1_id ELSE team2_id END
             WHERE id = $3 
             RETURNING *`,
            [team1Score, team2Score, matchId]
        );

        if (match.rows.length === 0) {
            throw new Error('Match not found');
        }

        // Create next round match if needed
        const currentMatch = match.rows[0];
        if (currentMatch.round < Math.ceil(Math.log2(currentMatch.tournament_teams_count))) {
            await createNextRoundMatch(client, currentMatch);
        }

        await client.query('COMMIT');
        return match.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const createNextRoundMatch = async (client, currentMatch) => {
    const nextRound = currentMatch.round + 1;
    const nextMatchNumber = Math.ceil(currentMatch.match_number / 2);

    // Check if next round match exists
    const existingMatch = await client.query(
        `SELECT * FROM tournament_matches 
         WHERE tournament_id = $1 AND round = $2 AND match_number = $3`,
        [currentMatch.tournament_id, nextRound, nextMatchNumber]
    );

    if (existingMatch.rows.length > 0) {
        // Update existing match with winner
        await client.query(
            `UPDATE tournament_matches 
             SET ${currentMatch.match_number % 2 === 1 ? 'team1_id' : 'team2_id'} = $1
             WHERE id = $2`,
            [currentMatch.winner_id, existingMatch.rows[0].id]
        );
    } else {
        // Create new match
        await client.query(
            `INSERT INTO tournament_matches 
             (tournament_id, round, match_number, 
              ${currentMatch.match_number % 2 === 1 ? 'team1_id' : 'team2_id'})
             VALUES ($1, $2, $3, $4)`,
            [currentMatch.tournament_id, nextRound, nextMatchNumber, currentMatch.winner_id]
        );
    }
};

const getTournamentBracket = async (tournamentId) => {
    const matches = await db.query(
        `SELECT m.*, 
                t1.name as team1_name, 
                t2.name as team2_name
         FROM tournament_matches m
         LEFT JOIN teams t1 ON m.team1_id = t1.id
         LEFT JOIN teams t2 ON m.team2_id = t2.id
         WHERE m.tournament_id = $1
         ORDER BY m.round, m.match_number`,
        [tournamentId]
    );

    return matches.rows;
};

module.exports = {
    generateBrackets,
    updateMatchScore,
    getTournamentBracket
};