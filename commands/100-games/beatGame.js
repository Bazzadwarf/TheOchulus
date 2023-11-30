const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beatgame')
        .setDescription('Log a game that you have beat towards the 100 game challenge!')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0))
        .addStringOption(option => option.setName('datestarted').setDescription('The date you started playing the game (today if empty).'))
        .addStringOption(option => option.setName('datebeaten').setDescription('The date you beat the game (today if empty).'))
        .addStringOption(option => option.setName('platform').setDescription('The platform the game was released on.')),
    async execute(interaction) {
        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');
        const platform = interaction.options.getString('platform');

        if (!gamename && !gameid) return interaction.reply('No gamename or gameid supplied, please supply an option to register a game!');

        let body = '';

        if (gameid) {
            body = body.concat('where id = ', gameid, '; ');
        } else if (gamename) {
            body = body.concat('search "', gamename, '"; ');
        }

        body = body.concat('fields *;');

        const res = await getGameJson(body);

        if (!res[0]) return interaction.reply('No game found for the options supplied.');

        const coverUrl = await getCoverURL(res[0].cover);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setAuthor({ name: `${interaction.user.displayName} beat a new game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${res[0].name} beaten!`)
            .setThumbnail(`${coverUrl}`)
            .setDescription(`${interaction.user.displayName} has beaten 69 games, they have 31 games remaining.`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};