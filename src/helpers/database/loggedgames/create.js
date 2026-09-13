const { createChangelogEntry, createLoggedGameEntry } = require('../changelog.js');
const { checkLoggedGameEntry } = require('./check.js');
const { GAME_STATUS } = require('../../gameStatus.js');

/**
 * Creates a LoggedGame entry for a user and game with a specified status and date.
 * If an entry already exists, it updates the status and logs the change in the Changelog.
 * Otherwise, it creates a new entry and logs the creation in the Changelog.
 * Returns the created or updated entry, or false if no changes were made.
*
* @async
* @param {Object} user - The user database object for who the game entry is being created or updated.
* @param {Object} game - The game database object for which the entry is being created or updated.
* @param {GAME_STATUS} status - The status of the game entry.
* @param {Date} date - The date of the game entry.
* @returns {Object} The created or updated game entry.
*/
async function createGameEntry(user, game, status, date) {
    const entry = await checkLoggedGameEntry(user, game);
    
    if (!entry) return await createLoggedGameEntry(user, game, status, date);
    
    if (entry.status == status) return false;
    
    await createChangelogEntry(user, game, entry.status, status);
    
    entry.status = status;
    
    if (!date) {
        entry.statusLastChanged = new Date();
    }
    else {
        entry.statusLastChanged = date;
    }
    
    await entry.save();
    
    return entry;
    
}

/**
 * Creates a Planning LoggedGame entry for a user and game with a specified date.
 * If an entry already exists, it updates the status and logs the change in the Changelog.
 * Otherwise, it creates a new entry and logs the creation in the Changelog.
 * Returns the created or updated entry, or false if no changes were made.
*
 * @async
 * @param {Object} user  - The user database object for who the game entry is being created or updated.
 * @param {Object} game - The game database object for which the entry is being created or updated.
 * @param {Date} date - The date of the game entry.
 * @returns {Object} The created or updated game entry.
 */
async function createPlanningGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.PLANNING, date);
}

/**
 * Creates a Playing LoggedGame entry for a user and game with a specified date.
 * If an entry already exists, it updates the status and logs the change in the Changelog.
 * Otherwise, it creates a new entry and logs the creation in the Changelog.
 * Returns the created or updated entry, or false if no changes were made.
 *
 * @async
 * @param {Object} user  - The user database object for who the game entry is being created or updated.
 * @param {Object} game - The game database object for which the entry is being created or updated.
 * @param {Date} date - The date of the game entry.
 * @returns {Object} The created or updated game entry.
 */
async function createPlayingGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.PLAYING, date);
}

/**
 * Creates a Beaten LoggedGame entry for a user and game with a specified date.
 * If an entry already exists, it updates the status and logs the change in the Changelog.
 * Otherwise, it creates a new entry and logs the creation in the Changelog.
 * Returns the created or updated entry, or false if no changes were made.
 *
 * @async
 * @param {Object} user  - The user database object for who the game entry is being created or updated.
 * @param {Object} game - The game database object for which the entry is being created or updated.
 * @param {Date} date - The date of the game entry.
 * @returns {Object} The created or updated game entry.
 */
async function createBeatenGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.BEAT, date);
}

module.exports = {
    createPlanningGameEntry,
    createPlayingGameEntry,
    createBeatenGameEntry
};