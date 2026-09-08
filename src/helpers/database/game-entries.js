const { createChangelogEntry, checkLoggedGameEntry, createLoggedGameEntry } = require('./changelog.js');
const { Users, Games, LoggedGames, Changelog } = require ('../../dbObjects');
const { Op } = require('sequelize');
const { GAME_STATUS } = require('../gameStatus.js');

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

async function createPlanningGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.PLANNING, date);
}

async function createPlayingGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.PLAYING, date);
}

async function createBeatenGameEntry(user, game, date) {
    return createGameEntry(user, game, GAME_STATUS.BEAT, date);
}

async function getPlanningGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.PLANNING);
}

async function getPlayingGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.PLAYING);
}

async function getBeatenGameCount(user) {
    return await getLoggedGameCount(user, GAME_STATUS.BEAT);
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
    return await deleteLoggedGameId(id, user, GAME_STATUS.PLANNING);
}

async function deletePlayingGameId(id, user) {
    return await deleteLoggedGameId(id, user, GAME_STATUS.PLAYING);
}

async function deleteBeatenGameId(id, user) {
    return await deleteLoggedGameId(id, user, GAME_STATUS.BEAT);
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
    return await deleteLoggedGameNum(num, user, GAME_STATUS.PLANNING);
}

async function deletePlayingGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, GAME_STATUS.PLAYING);
}

async function deleteBeatenGameNum(num, user) {
    return await deleteLoggedGameNum(num, user, GAME_STATUS.BEAT);
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

async function getRecentPlanningGameEntry(userId) {
    return await getRecentGameEntry(userId, GAME_STATUS.PLANNING);
}

async function getRecentPlayingGameEntry(userId) {
    return await getRecentGameEntry(userId, GAME_STATUS.PLAYING);
}

async function getRecentBeatenGameEntry(userId) {
    return await getRecentGameEntry(userId, GAME_STATUS.BEAT);
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
    return await getGames(id, GAME_STATUS.PLANNING);
}

async function getPlayingGames(id) {
    return await getGames(id, GAME_STATUS.PLAYING);
}

async function getBeatenGames(id) {
    return await getGames(id, GAME_STATUS.BEAT);
}

async function getGames(id, status) {
    const gameEntries = await LoggedGames.findAll({ where: { userId: id, status: status }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

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

async function getAllBeatenGames() {
    const gameEntries = await LoggedGames.findAll({ where: { status: GAME_STATUS.BEAT }, order: [ [ 'statusLastChanged', 'ASC' ]] })
    .catch((err) => {
        console.log(err);
    });

    if (gameEntries) return gameEntries;

    return false;
}

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

async function getBeatenGameCountBetweenDates(userId, start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const count = await LoggedGames.count({ where: { userId: userId, status: GAME_STATUS.BEAT, statusLastChanged: { [ Op.between ]: [startDate, endDate] } } })
    .catch((err) => {
        console.log(err);
    });

    return count;
}


module.exports = {
    createPlanningGameEntry,
    createPlayingGameEntry,
    createBeatenGameEntry,
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
    getRecentPlanningGameEntry,
    getRecentPlayingGameEntry,
    getRecentBeatenGameEntry,
    getRecentGameEntry,
    getRecentEntry,
    getPlanningGames,
    getPlayingGames,
    getBeatenGames,
    getGames,
    getBeatenGamesForYear,
    getAllBeatenGames,
    getAllBeatenGamesBetweenDates,
    getBeatenGameCountBetweenDates
};