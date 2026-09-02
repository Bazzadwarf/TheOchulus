const { Games } = require ('../../dbObjects');

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

module.exports = {
    checkGameStorage,
    checkGameStorageId,
};