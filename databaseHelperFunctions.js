const { Users, Games, LoggedGames, Changelog } = require ('./dbObjects.js');
const fs = require('fs');
const { Op } = require('sequelize');

async function checkUserRegistration(user) {

    const u = await Users.findOne({ where: { discord_id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (u) return true;

    return false;
}

async function getUserRegistration(user) {

    let u = await Users.findOne({ where: { discord_id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (u) return u;

    await Users.create({ discord_id: user.id, username: user.username })
    .then((data) => {
        u = data;
    })
    .catch((err) => {
        console.log(err);
    });

    if (u) return u;

    return null;
}

async function getUserFromId(id) {
    const u = await Users.findOne({ where: { id: id } })
    .catch((err) => {
        console.log(err);
    });

    if (u) return u;

    return null;
}

async function checkGameStorage(game) {
    let g = await Games.findOne({ where: { igdb_id: game.id, name: game.name } })
    .catch((err) => {
        console.log(err);
    });

    if (g) return g;

    await Games.create({ igdb_id: game.id, name: game.name })
    .then((data) => {
        g = data;
    })
    .catch((err) => {
        console.log(err);
    });

    if (g) return g;

    return null;
}

async function checkGameStorageId(id) {
    const g = await Games.findOne({ where: { id: id } })
    .catch((err) => {
        console.log(err);
    });

    if (g) return g;

    return null;
}

async function createPlanningGameEntry(user, game, date) {
    const entry = await checkLoggedGameEntry(user, game);

    if (!entry) return await createLoggedGameEntry(user, game, 'planning', date);

    if (entry.status == 'planning') return false;

    await createChangelogEntry(user, game, entry.status, 'planning');

    entry.status = 'planning';

    if (!date) {
        entry.statusLastChanged = new Date();
    }
    else {
        entry.statusLastChanged = date;
    }

    await entry.save();

    return entry;
}

async function createPlayingGameEntry(user, game, date) {
    const entry = await checkLoggedGameEntry(user, game);

    if (!entry) return await createLoggedGameEntry(user, game, 'playing', date);

    if (entry.status == 'playing') return false;

    await createChangelogEntry(user, game, entry.status, 'playing');

    entry.status = 'playing';

    if (!date) {
        entry.statusLastChanged = new Date();
    }
    else {
        entry.statusLastChanged = date;
    }

    await entry.save();

    return entry;
}

async function createBeatenGameEntry(user, game, date) {
    const entry = await checkLoggedGameEntry(user, game);

    if (!entry) return await createLoggedGameEntry(user, game, 'beat', date);

    if (entry.status == 'beat') return false;

    await createChangelogEntry(user, game, entry.status, 'beat');

    entry.status = 'beat';

    if (!date) {
        entry.statusLastChanged = new Date();
    }
    else {
        entry.statusLastChanged = date;
    }

    await entry.save();

    return entry;
}

async function createChangelogEntry(user, game, oldStatus, newStatus) {
    return await Changelog.create({ userId: user.id, gameId: game.id, newStatus: newStatus, oldStatus: oldStatus })
    .catch((err) => {
        console.log(err);
    });
}

async function checkLoggedGameEntry(user, game) {
    const bg = await LoggedGames.findOne({ where: { userId: user.id, gameId: game.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!bg) return false;

    return bg;
}

async function createLoggedGameEntry(user, game, status, date) {
    let bg;

    await LoggedGames.create({ userId: user.id, gameId: game.id, status: status, statusLastChanged: date })
    .then((data) => {
        bg = data;
    })
    .catch((err) => {
        console.log(err);
    });

    if (bg) {
        await Changelog.create({ userId: user.id, gameId: game.id, newStatus: status })
        .catch((err) => {
            console.log(err);
        });

        return true;
    }

    return false;
}

async function getPlanningGameCount(user) {
    return await getLoggedGameCount(user, 'planning');
}

async function getPlayingGameCount(user) {
    return await getLoggedGameCount(user, 'playing');
}

async function getBeatenGameCount(user) {
    return await getLoggedGameCount(user, 'beat');
}

async function getLoggedGameCount(user, status) {
    const u = await Users.findOne({ where: { id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!u) return -1;

    const count = await u.countBeatenGames({ where: { status: status } });

    return count;
}

async function deletePlanningGameId(id, user) {
    return await deleteLoggedGameId(id, user, 'planning');
}

async function deletePlayingGameId(id, user) {
    return await deleteLoggedGameId(id, user, 'playing');
}

async function deleteBeatenGameId(id, user) {
    return await deleteLoggedGameId(id, user, 'beat');
}

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

async function deletePlanningGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, 'planning');
}

async function deletePlayingGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, 'playing');
}

async function deleteBeatenGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, 'beat');
}

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

async function getLeaderboardEntries() {
    const users = await Users.findAll()
    .catch((err) => {
        console.log(err);
    });

    const results = [];

    for (let i = 0; i < users.length; i++) {
        const count = await LoggedGames.count({ where: { userId: users[i].id, status: 'beat' } });

        const res = await Users.findOne({ where: { id: users[i].id } })
        .catch((err) => {
            console.log(err);
        });
        const username = res.username;

        const fun = { username, count };
        results.push(fun);
    }

    return results;
}

async function getLeaderboardEntriesBetweenDates(start, end) {
    const users = await Users.findAll()
    .catch((err) => {
        console.log(err);
    });

    const results = [];

    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let i = 0; i < users.length; i++) {
        const count = await LoggedGames.count({ where: { userId: users[i].id, status: 'beat', statusLastChanged: { [ Op.between ]: [startDate, endDate] } } });

        const res = await Users.findOne({ where: { id: users[i].id } })
        .catch((err) => {
            console.log(err);
        });
        const username = res.username;

        const fun = { username, count };
        results.push(fun);
    }

    return results;
}

async function getRecentPlanningGameEntry(userId) {
    return await getRecentGameEntry(userId, 'planning');
}

async function getRecentPlayingGameEntry(userId) {
    return await getRecentGameEntry(userId, 'playing');
}

async function getRecentBeatenGameEntry(userId) {
    return await getRecentGameEntry(userId, 'beat');
}

async function getRecentGameEntry(userId, status) {
    const beatenGameEntry = await LoggedGames.findOne({ where: { userId: userId, status: status }, order: [ [ 'statusLastChanged', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (!beatenGameEntry) return false;

    const game = await Games.findOne({ where: { id: beatenGameEntry.gameId } })
    .catch((err) => {
        console.log(err);
    });

    if (game) return game;

    return false;
}

async function getRecentEntry(userId) {
    const beatenGameEntry = await LoggedGames.findOne({ where: { userId: userId }, order: [ [ 'statusLastChanged', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (!beatenGameEntry) return false;

    return beatenGameEntry;
}

async function getPlanningGames(id) {
    return await getGames(id, 'planning');
}

async function getPlayingGames(id) {
    return await getGames(id, 'playing');
}

async function getBeatenGames(id) {
    return await getGames(id, 'beat');
}

async function getGames(id, status) {
    const gameEntries = await LoggedGames.findAll({ where: { userId: id, status: status }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

async function getAllBeatenGames() {
    const gameEntries = await LoggedGames.findAll({ where: { status: 'beat' }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

async function backupDatabase() {
    const date = new Date().toJSON().slice(0, 10);

    if (fs.existsSync('./database.sqlite')) {
        // I know that this is probably not the best way to do this but for now it is fine.
        fs.copyFile('./database.sqlite', String.prototype.concat('./backups/database-', date, '.sqlite'), (err) => {
            console.log(err);
        });
    }
}

async function getChangelog(id) {
    const changelogEntries = await Changelog.findAll({ where: { userId: id }, order: [ [ 'updatedAt', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (changelogEntries) return changelogEntries;

    return false;
}

async function getAllChangelog() {
    const changelogEntries = await Changelog.findAll({ order: [ [ 'updatedAt', 'DESC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (changelogEntries) return changelogEntries;

    return false;
}

module.exports = {
    checkUserRegistration,
    getUserRegistration,
    getUserFromId,
    checkGameStorage,
    createPlanningGameEntry,
    createPlayingGameEntry,
    createBeatenGameEntry,
    createLoggedGameEntry,
    getPlanningGameCount,
    getPlayingGameCount,
    getBeatenGameCount,
    getLoggedGameCount,
    deletePlanningGameId,
    deletePlayingGameId,
    deleteBeatenGameId,
    deletePlanningGameNum,
    deletePlayingGameNum,
    deleteBeatenGameNum,
    checkGameStorageId,
    getLeaderboardEntries,
    getRecentPlanningGameEntry,
    getRecentPlayingGameEntry,
    getRecentBeatenGameEntry,
    getRecentGameEntry,
    getRecentEntry,
    getPlanningGames,
    getPlayingGames,
    getBeatenGames,
    getGames,
    getAllBeatenGames,
    backupDatabase,
    getChangelog,
    getAllChangelog,
    getLeaderboardEntriesBetweenDates,
};