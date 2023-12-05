const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

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

        let body = '';

        if (gameid) {
            await interaction.reply(`Searching for ${gameid}...`);
            body = body.concat('where id = ', gameid, '; ');
        } else if (gamename) {
            await interaction.reply(`Searching for ${gamename}...`);
            body = body.concat('search "', gamename, '"; ');
        }

        body = body.concat('fields *; limit 25; where (category = 0 | category = 4) & version_parent = null;');

        const games = await getGameJson(body);

        if (!games[0]) return interaction.followUp('No game found.');

        await games.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        const game = games[0];

        const coverUrl = await getCoverURL(game.cover);

        const release_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(game.first_release_date * 1000);

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setTitle(`${game.name}`)
        .setURL(`${game.url}`)
        .setThumbnail(`${coverUrl}`)
        .addFields({ name: 'Description', value: `${game.summary}` })
        .addFields({ name: 'Developers', value: `${game.involved_companies.join(', ')}`, inline: true })
        .addFields({ name: 'Release Date', value: `${release_date}`, inline: true })
        .addFields({ name: 'Genres', value: `${game.genres.join(', ')}`, inline: true })
        .addFields({ name: 'Rating', value: `${game.total_rating.toFixed(0)} / 100, ${game.total_rating_count } ratings`, inline: true })
        .addFields({ name: 'Franchise', value: `${game.franchises}`, inline: true })
        .addFields({ name: 'ID', value: `${game.id}`, inline: true })
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    },
};