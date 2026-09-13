const { LoggedGames } = require ('../../../dbObjects.js');
const { Op } = require('sequelize');
const { GAME_STATUS } = require('../../gameStatus.js');

/**
 * Gets all planning LoggedGame entries for a user with a specific id.
 *
 * @async
 * @param {number} id - The ID of the user for who to get games.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getPlanningGames(id) {
    return await getGames(id, GAME_STATUS.PLANNING);
}

/**
 * Gets all playing LoggedGame entries for a user with a specific id.
 *
 * @async
 * @param {number} id - The ID of the user for who to get games.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getPlayingGames(id) {
    return await getGames(id, GAME_STATUS.PLAYING);
}

/**
 * Gets all beaten LoggedGame entries for a user with a specific id.
 *
 * @async
 * @param {number} id - The ID of the user for who to get games.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getBeatenGames(id) {
    return await getGames(id, GAME_STATUS.BEAT);
}

/**
 * Gets all games for a user with a specific status
 *
 * @async
 * @param {number} id - The ID of the user for who to get games.
 * @param {GAME_STATUS} status - The status of the games to retrieve.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getGames(id, status) {
    const gameEntries = await LoggedGames.findAll({ where: { userId: id, status: status }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

/**
 * Gets all beaten LoggedGame entries for a user within a specific date range.
 *
 * @async
 * @param {number} userId - The ID of the user for who to get games.
 * @param {Date} start - The start date of the range.
 * @param {Date} end - The end date of the range.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getBeatenGamesForYear(userId, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const gameEntries = await LoggedGames.findAll({ where: { userId: userId, status: GAME_STATUS.BEAT, statusLastChanged: { [ Op.between ]: [startDate, endDate] } }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

/**
 * Gets all beaten LoggedGame entries.
 *
 * @async
 * @returns {Object} An array of LoggedGame entries.
 */
async function getAllBeatenGames() {
    const gameEntries = await LoggedGames.findAll({ where: { status: GAME_STATUS.BEAT }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

/**
 * Gets all beaten LoggedGame entries within a specific date range.
 *
 * @async
 * @param {Date} start - The start date of the range.
 * @param {Date} end - The end date of the range.
 * @returns {Object} An array of LoggedGame entries.
 */
async function getAllBeatenGamesBetweenDates(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const gameEntries = await LoggedGames.findAll({ where: { status: GAME_STATUS.BEAT, statusLastChanged: { [ Op.between ]: [startDate, endDate] } }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

module.exports = {
    getPlanningGames,
    getPlayingGames,
    getBeatenGames,
    getBeatenGamesForYear,
    getAllBeatenGames,
    getAllBeatenGamesBetweenDates
};
