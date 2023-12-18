const { SlashCommandBuilder } = require('discord.js');
const { Users } = require ('./dbObjects.js');

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

module.exports = {
    checkUserRegistration,
};