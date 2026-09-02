const { Users } = require('../../dbObjects');

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

module.exports = {
    checkUserRegistration,
    getUserRegistration,
    getUserFromId
};