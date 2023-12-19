const { Users, Games, BeatenGames } = require ('./dbObjects.js');

async function checkUserRegistration(user) {

    let u = await Users.findOne({ where: { discord_id: user.id } })
    .catch((err) => {
        console.log(err);
    });

    if (u) return true;

    await Users.create({ discord_id: user.id, username: user.username })
    .then((data) => {
        u = data;
    })
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
    const bg = await BeatenGames.findOne({ where: { id: id, userId: user.id } })
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

module.exports = {
    checkUserRegistration,
    getUserRegistration,
    checkGameStorage,
    createBeatenGameEntry,
    getBeatenGameCount,
    deleteBeatenGameId,
    deleteBeatenGameNum,
    checkGameStorageId,
};