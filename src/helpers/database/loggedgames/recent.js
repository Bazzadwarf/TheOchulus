const { Games, LoggedGames } = require ('../../../dbObjects.js');
const { GAME_STATUS } = require('../../gameStatus.js');

/**
 * Gets the most recent logged game entry for a user.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent entry for the user, or false if no entry is found.
 */
async function getRecentEntry(user) {
    const loggedGameEntry = await LoggedGames.findOne({ where: { userId: user.id }, order: [ [ 'statusLastChanged', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (!loggedGameEntry) return false;

    return loggedGameEntry;
}

/**
 * Gets the most recent game entry for a user with a specific status.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @param {number} status - The status of the game to get.
 * @returns {Object|boolean} - The most recent game entry for the user with the specified status, or false if no entry is found.
 */
async function getRecentGameEntry(user, status) {
    const loggedGameEntry = await LoggedGames.findOne({ where: { userId: user.id, status: status }, order: [ [ 'statusLastChanged', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (!loggedGameEntry) return false;

    const game = await Games.findOne({ where: { id: loggedGameEntry.gameId } })
    .catch((err) => {
        console.log(err);
    });

    if (game) return game;

    return false;
}

/**
 * Gets the most recent planned game entry for a user with a specific status.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent planned game entry for the user with the specified status, or false if no entry is found.
 */
async function getRecentPlanningGameEntry(user) {
    return await getRecentGameEntry(user, GAME_STATUS.PLANNING);
}

/**
 * Gets the most recent playing game entry for a user with a specific status.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent playing game entry for the user with the specified status, or false if no entry is found.
 */
async function getRecentPlayingGameEntry(user) {
    return await getRecentGameEntry(user, GAME_STATUS.PLAYING);
}

/**
 * Gets the most recent beaten game entry for a user with a specific status.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent beaten game entry for the user with the specified status, or false if no entry is found.
 */
async function getRecentBeatenGameEntry(user) {
    return await getRecentGameEntry(user, GAME_STATUS.BEAT);
}

/**
 * Gets the most recent logged game entry for a user with a specific status.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @param {number} status - The status of the game to get.
 * @returns {Object|boolean} - The most recent logged game entry for the user with the specified status, or false if no entry is found.
 */
async function getRecentLoggedGameEntry(user, status) {
    return await LoggedGames.findOne({ where: { userId: user.id, status: status }, order: [ [ 'statusLastChanged', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });
}

/**
 * Gets the most recent planned logged game entry for a user.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent planned logged game entry for the user, or false if no entry is found.
 */
async function getRecentPlanningLoggedGameEntry(user) {
    return await getRecentLoggedGameEntry(user, GAME_STATUS.PLANNING);
}

/**
 * Gets the most recent playing logged game entry for a user.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent playing logged game entry for the user, or false if no entry is found.
 */
async function getRecentPlayingLoggedGameEntry(user) {
    return await getRecentLoggedGameEntry(user, GAME_STATUS.PLAYING);
}

/**
 * Gets the most recent beaten logged game entry for a user.
 *
 * @async
 * @param {Object} user - The user to get the most recent entry for.
 * @returns {Object|boolean} - The most recent beaten logged game entry for the user, or false if no entry is found.
 */
async function getRecentBeatenLoggedGameEntry(user) {
    return await getRecentLoggedGameEntry(user, GAME_STATUS.BEAT);
}

module.exports = {
    getRecentEntry,
    getRecentPlanningGameEntry,
    getRecentPlayingGameEntry,
    getRecentBeatenGameEntry,
    getRecentPlanningLoggedGameEntry,
    getRecentPlayingLoggedGameEntry,
    getRecentBeatenLoggedGameEntry
};
