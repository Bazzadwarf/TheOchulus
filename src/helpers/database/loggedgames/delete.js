const { LoggedGames, Changelog } = require ('../../../dbObjects.js');
const { GAME_STATUS } = require('../../gameStatus.js');

/**
 * Deletes a LoggedGame entry for a user and game with a specified id and status.
 * If an entry already exists, it deletes the entry and logs the change in the Changelog.
 * Returns the deleted entry, or false if no changes were made.
 *
 * @async
 * @param {number} id - The game database id for which the entry is being deleted.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @param {GAME_STATUS} status - The status of the LoggedGame entry to delete.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deleteLoggedGameId(id, user, status) {
    const bg = await LoggedGames.findOne({ where: { gameId: id, userId: user.id, status: status } })
    .catch((err) => {
        console.log(err);
    });

    if (!bg) return false;

    const entry = bg;
    await bg.destroy();

    if (bg) {
        await Changelog.create({ userId: user.id, gameId: entry.gameId, oldStatus: status })
        .catch((err) => {
            console.log(err);
        });
    }

    return entry;
}

/**
 * Deletes a Planning LoggedGame entry for a user and game with a specified id.
 * If an entry already exists, it deletes the entry and logs the change in the Changelog.
 * Returns the deleted entry, or false if no changes were made.
 *
 * @async
 * @param {number} id - The game database id for which the entry is being deleted.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deletePlanningGameId(id, user) {
    return await deleteLoggedGameId(id, user, GAME_STATUS.PLANNING);
}

/**
 * Deletes a Playing LoggedGame entry for a user and game with a specified id.
 * If an entry already exists, it deletes the entry and logs the change in the Changelog.
 * Returns the deleted entry, or false if no changes were made.
 *
 * @async
 * @param {number} id - The game database id for which the entry is being deleted.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deletePlayingGameId(id, user) {
    return await deleteLoggedGameId(id, user, GAME_STATUS.PLAYING);
}

/**
 * Deletes a Beaten LoggedGame entry for a user and game with a specified id.
 * If an entry already exists, it deletes the entry and logs the change in the Changelog.
 * Returns the deleted entry, or false if no changes were made.
 *
 * @async
 * @param {number} id - The game database id for which the entry is being deleted.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deleteBeatenGameId(id, user) {
    return await deleteLoggedGameId(id, user, GAME_STATUS.BEAT);
}

/**
 * Deletes a LoggedGame entry for a user at a specific position and status.
 *
 * @async
 * @param {number} num - The position of the entry to delete.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @param {GAME_STATUS} status - The status of the LoggedGame entries to delete.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deleteLoggedGameNum(num, user, status) {
    const bg = await LoggedGames.findAll({ where: { userId: user.id, status: status } })
    .catch((err) => {
        console.log(err);
    });

    if (!bg) return false;

    if (bg.length < num) return false;

    const entry = bg[num - 1];
    await bg[num - 1].destroy();

    if (bg) {
        await Changelog.create({ userId: user.id, gameId: entry.gameId, oldStatus: status })
        .catch((err) => {
            console.log(err);
        });
    }

    return entry;
}

/**
 * Deletes a planning LoggedGame entry for a user at a specific position and status.
 *
 * @async
 * @param {number} num - The position of the entry to delete.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deletePlanningGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, GAME_STATUS.PLANNING);
}

/**
 * Deletes a playing LoggedGame entry for a user at a specific position and status.
 *
 * @async
 * @param {number} num - The position of the entry to delete.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deletePlayingGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, GAME_STATUS.PLAYING);
}

/**
 * Deletes a beaten LoggedGame entry for a user at a specific position and status.
 *
 * @async
 * @param {number} num - The position of the entry to delete.
 * @param {Object} user - The user database object for who the LoggedGame is being deleted.
 * @returns {Object|boolean} The deleted LoggedGame entry, or false if no changes were made.
 */
async function deleteBeatenGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, GAME_STATUS.BEAT);
}

module.exports = {
    deletePlanningGameId,
    deletePlayingGameId,
    deleteBeatenGameId,
    deletePlanningGameNum,
    deletePlayingGameNum,
    deleteBeatenGameNum
};
