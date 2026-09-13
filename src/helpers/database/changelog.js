const { LoggedGames, Changelog } = require ('../../dbObjects');
const { Op } = require('sequelize');

async function createChangelogEntry(user, game, oldStatus, newStatus) {
    return await Changelog.create({ userId: user.id, gameId: game.id, newStatus: newStatus, oldStatus: oldStatus })
    .catch((err) => {
        console.log(err);
    });
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

async function getChangelog(id, startDate, endDate) {
    const changelogEntries = await Changelog.findAll({ where: { userId: id, createdAt: { [ Op.between ]: [startDate, endDate] } }, order: [ [ 'updatedAt', 'DESC' ]] })
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
    createChangelogEntry,
    createLoggedGameEntry,
    getChangelog,
    getAllChangelog
};