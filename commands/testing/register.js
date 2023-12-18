const { SlashCommandBuilder } = require('discord.js');
const { Users } = require ('../../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Manually registers the user into the user database.'),

    async execute(interaction) {
        // interaction.user is the object representing the user who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild

        const user = await Users.findOne({ where: { discord_id: interaction.user.id } })
                    .catch((err) => {
                        console.log(err);
                    });
        if (user) return interaction.reply(`User "${interaction.user.username}" is already registered`);

        await Users.create({ discord_id: interaction.user.id, username: interaction.user.username })
        .then(await interaction.reply(`${interaction.user.username} was manually registered.`))
        .catch((err) => {
            console.log(err);
        });
    },
};