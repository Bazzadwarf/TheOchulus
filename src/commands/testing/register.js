const { SlashCommandBuilder } = require('discord.js');
const { getUserRegistration } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Manually registers the user into the user database.'),

    async execute(interaction) {
        // interaction.user is the object representing the user who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild

        if (getUserRegistration(interaction.user)) return interaction.reply(`User "${interaction.user.username}" is registered`);

        return interaction.reply({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });
    },
};