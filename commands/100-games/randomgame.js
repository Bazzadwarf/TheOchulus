const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson, getCompanyInfo, getGenres, getReleaseDates } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomgame')
        .setDescription('[Experimental] Get a random game from the IGDB database.')
        .addBooleanOption(option => option.setName('madness').setDescription('Let The Ochulus off the rails at your own risk')),
        async execute(interaction) {

        await interaction.deferReply('The Ochulus is pondering its options...');

        let games = [];
        const count = interaction.options.getBoolean('madness') ? 0 : 27;

        while (games.length == 0) {
            const offset = Math.floor(Math.random() * 10000);
            const body = `fields *; limit 1; offset ${offset}; where (category = 0 | category = 4 | category = 8 | category = 9) & version_parent = null & total_rating_count >= ${count};`;
            games = await getGameJson(body);
        }

        await games.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        const game = games[0];

        const coverUrl = game.cover ? await getCoverURL(game.cover) : '';

        let release_date;
        if (game.first_release_date) {
            release_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(game.first_release_date * 1000);
        } else if (game.release_dates) {
            release_date = await getReleaseDates(game.release_dates[0]);
        }

        const genres = [];
        if (game.genres) {
            for (const genreId of game.genres) {
                const genre = await getGenres(genreId);
                genres.push(genre);
            }
        }

        const user = interaction.user;

        // Build Embed
        const embed = new EmbedBuilder();
        embed.setColor(0x6441a5);
        embed.setAuthor({ name: `${user.displayName}'s Random Game`, iconURL: user.avatarURL() });
        embed.setTitle('THE OCHULUS HAS SPOKEN');
        embed.setDescription(`It has chosen **[${game.name}](${game.url})**, glory be to The Ochulus!`);

        if (game.summary) {
            embed.addFields({ name: 'Description', value: `${game.summary.length > 1024 ? game.summary.substring(0, 1024) : game.summary}` });
        }

        if (game.cover) {
            embed.setThumbnail(`${coverUrl}`);
        }

        if (game.involved_companies) {
            const companies = [];

            for (const company of game.involved_companies) {
                const info = await getCompanyInfo(company);
                if (info.name) {
                    companies.push(info.name);
                }
            }

            embed.addFields({ name: 'Developers', value: `${companies.join(', ')}`, inline: true });
        }

        if (release_date) {
            embed.addFields({ name: 'Release Date', value: `${release_date}`, inline: true });
        }

        if (genres.length > 0) {
            embed.addFields({ name: 'Genres', value: `${genres.join(', ')}`, inline: true });
        }


        if (game.total_rating) {
            embed.addFields({ name: 'Rating', value: `${game.total_rating.toFixed(0)} / 100, ${game.total_rating_count } ratings`, inline: true });
        }
        embed.addFields({ name: 'ID', value: `${game.id}`, inline: true });

        embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });
        embed.setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};