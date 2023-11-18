const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beatgame')
        .setDescription('Log a game that you have beat towards the 100 game challenge!')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.'))
        .addStringOption(option => option.setName('datestarted').setDescription('The date you started playing the game (today if empty).'))
        .addStringOption(option => option.setName('datebeaten').setDescription('The date you beat the game (today if empty).')),
    async execute(interaction) {
        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');

        if (!gamename && !gameid) return interaction.reply('No gamename or gameid supplied, please supply an option to register a game!');
        if (gameid) return interaction.reply(`Game ID "${gameid}" has been beaten, Game logged!`);
        return interaction.reply(`Game "${gamename}" has been beaten, Game logged!`);
    },
};