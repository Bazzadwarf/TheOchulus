const { LoggedGames } = require ('../../../dbObjects.js');

/**
 * Checks if a LoggedGame entry exists for a given user and game.
*
* @async
* @param {Object} user - The user database object for who the game entry thatis being checked.
* @param {Object} game - The game database object for which the entry is being checked.
* @returns {Object} The existing game entry or false if no entry exists.
*/
async function checkLoggedGameEntry(user, game) {
    const bg = await LoggedGames.findOne({ where: { userId: user.id, gameId: game.id } })
    .catch((err) => {
        console.log(err);
    });
    
    if (!bg) return false;
    
    return bg;
}

module.exports = {
    checkLoggedGameEntry,
};