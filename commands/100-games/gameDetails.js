const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamedetails')
        .setDescription('Get the details of a given game.')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0)),
    async execute(interaction) {
        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');

        if (!gamename && !gameid) return interaction.reply('No gamename or gameid supplied, please supply an option to register a game!');

        const embed = new EmbedBuilder()
            .setColor(0x6441a5);


        if (gameid) {
            embed.setTitle(gameid);
        } else if (gamename) {
            embed.setTitle(gamename);
        }

        return interaction.reply({ embeds: [embed] });
    },
};