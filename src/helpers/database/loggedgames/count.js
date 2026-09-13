const { Users, LoggedGames } = require ('../../../dbObjects.js');
const { Op } = require('sequelize');
const { GAME_STATUS } = require('../../gameStatus.js');

/**
 * Checks the count of LoggedGame entries for a given user and status.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {GAME_STATUS} status - The status of the LoggedGame entries to count.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getLoggedGameCount(user, status) {
    const u = await Users.findOne({ where: { id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!u) return -1;

    const count = await u.countBeatenGames({ where: { status: status } });

    return count;
}

/**
 * Checks the count of Planning LoggedGame entries for a given user.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getPlanningGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.PLANNING);
}

/**
 * Checks the count of Playing LoggedGame entries for a given user.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getPlayingGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.PLAYING);
}

/**
 * Checks the count of Beaten LoggedGame entries for a given user.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getBeatenGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.BEAT);
}

/**
 * Gets the count of LoggedGame entries for a given user and status between two dates.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {GAME_STATUS} status - The status of the LoggedGame entries to count.
 * @param {Date} start - The start date for the date range.
 * @param {Date} end - The end date for the date range.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getGameCountBetweenDates(user, status, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const count = await LoggedGames.count({ where: { userId: user.id, status: status, statusLastChanged: { [ Op.between ]: [startDate, endDate] } } })
    .catch((err) => {
        console.log(err);
    });

    return count;
}

/**
 * Gets the count of LoggedGame entries for a given user and status between two dates.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {GAME_STATUS} status - The status of the LoggedGame entries to count.
 * @param {Date} start - The start date for the date range.
 * @param {Date} end - The end date for the date range.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getGameCountBetweenDates(user, status, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const count = await LoggedGames.count({ where: { userId: user.id, status: status, statusLastChanged: { [ Op.between ]: [startDate, endDate] } } })
    .catch((err) => {
        console.log(err);
    });

    return count;
}

/**
 * Gets the count of planning LoggedGame entries for a given user and status between two dates.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {Date} start - The start date for the date range.
 * @param {Date} end - The end date for the date range.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getPlanningGameCountBetweenDates(user, start, end) {
    return getGameCountBetweenDates(user, GAME_STATUS.PLANNING, start, end);
}

/**
 * Gets the count of playing LoggedGame entries for a given user and status between two dates.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {Date} start - The start date for the date range.
 * @param {Date} end - The end date for the date range.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getPlayingGameCountBetweenDates(user, start, end) {
    return getGameCountBetweenDates(user, GAME_STATUS.PLAYING, start, end);
}

/**
 * Gets the count of beaten LoggedGame entries for a given user and status between two dates.
 *
 * @async
 * @param {Object} user - The user database object for who the LoggedGame count is being checked.
 * @param {Date} start - The start date for the date range.
 * @param {Date} end - The end date for the date range.
 * @returns {number} The count of LoggedGame entries matching the criteria.
 */
async function getBeatenGameCountBetweenDates(user, start, end) {
    return getGameCountBetweenDates(user, GAME_STATUS.BEAT, start, end);
}

module.exports = {
    getPlanningGameCount,
    getPlayingGameCount,
    getBeatenGameCount,
    getPlanningGameCountBetweenDates,
    getPlayingGameCountBetweenDates,
    getBeatenGameCountBetweenDates
};
