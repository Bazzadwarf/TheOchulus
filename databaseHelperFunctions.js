const { Users, Games, BeatenGames } = require ('./dbObjects.js');
const fs = require('fs');

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

async function createBeatenGameEntry(user, game) {
    let bg = await BeatenGames.findOne({ where: { userId: user.id, gameId: game.id } })
    .catch((err) => {
        console.log(err);
    });

    if (bg) return false;

    await BeatenGames.create({ userId: user.id, gameId: game.id })
    .then((data) => {
        bg = data;
    })
    .catch((err) => {
        console.log(err);
    });

    if (bg) return true;

    return false;
}

async function getBeatenGameCount(user) {
    const u = await Users.findOne({ where: { id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!u) return -1;

    const count = await u.countBeatenGames();

    return count;
}

async function deleteBeatenGameId(id, user) {
    const bg = await BeatenGames.findOne({ where: { gameId: id, userId: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!bg) return false;

    const entry = bg;
    await bg.destroy();

    return entry;
}

async function deleteBeatenGameNum(num, user) {
    const bg = await BeatenGames.findAll({ where: { userId: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (!bg) return false;

    if (bg.length < num) return false;

    const entry = bg[num - 1];
    await bg[num - 1].destroy();

    return entry;
}

async function getLeaderboardEntries() {
    const users = await Users.findAll()
    .catch((err) => {
        console.log(err);
    });

    const results = [];

    for (let i = 0; i < users.length; i++) {
        const count = await BeatenGames.count({ where: { userId: users[i].id } });

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

async function getRecentGameEntry(userId) {
    const beatenGameEntry = await BeatenGames.findOne({ where: { userId: userId }, order: [ [ 'createdAt', 'DESC' ]] })
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

async function getGames(id) {
    const beatenGameEntry = await BeatenGames.findAll({ where: { userId: id } })
    .catch((err) => {
        console.log(err);
    });

    if (beatenGameEntry) return beatenGameEntry;

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

module.exports = {
    checkUserRegistration,
    getUserRegistration,
    checkGameStorage,
    createBeatenGameEntry,
    getBeatenGameCount,
    deleteBeatenGameId,
    deleteBeatenGameNum,
    checkGameStorageId,
    getLeaderboardEntries,
    getRecentGameEntry,
    getGames,
    backupDatabase,
};