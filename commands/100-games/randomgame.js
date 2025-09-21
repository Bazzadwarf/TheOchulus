const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson, getInvolvedCompanies, getCompanies, getGenres, getReleaseDates, getFranchise, getTimeToBeat } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomgame')
        .setDescription('Get a random game from the IGDB database.')
        .addBooleanOption(option => option.setName('madness').setDescription('Let The Ochulus off the rails at your own risk')),
        async execute(interaction) {

        await interaction.deferReply();

        let games = [];
        const count = interaction.options.getBoolean('madness') ? 0 : 27;

        while (games.length == 0) {
            const offset = Math.floor(Math.random() * 10000);
            const body = `fields *; limit 1; offset ${offset}; where version_parent = null & total_rating_count >= ${count};`;
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

        const genreNames = [];
        if (game.genres)
        {
            const genres = await getGenres(game.genres);

            for (const genre of genres) {
                genreNames.push(genre.name);
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

            const involvedCompanies = await getInvolvedCompanies(game.involved_companies);
            const companyIds = new Set();
            for (let i = 0; i < involvedCompanies.length; i++) {
                if (involvedCompanies[i].company)
                {
                    companyIds.add(involvedCompanies[i].company);
                }
            }

            const compIds = [...companyIds];
            const companies = await getCompanies(compIds);

            const developers = [];
            const publishers = [];

            for (const company of companies) {
                if (company.developed)
                {
                    if (company.developed.find(item => item === game.id)) {
                        developers.push(`[${company.name}](${company.url})`);
                    }
                }


                if (company.published)
                {
                    if (company.published.find(item => item === game.id)) {
                        publishers.push(`[${company.name}](${company.url})`);
                    }
                }
            }

            if (developers.length > 0)
            {
                embed.addFields({ name: 'Developers', value: `${developers.join(', ')}`, inline: true });
            }

            if (publishers.length > 0)
            {
                embed.addFields({ name: 'Publishers', value: `${publishers.join(', ')}`, inline: true });
            }
        }

        if (release_date) {
            embed.addFields({ name: 'Release Date', value: `${release_date}`, inline: true });
        }

        if (genreNames.length > 0) {
            embed.addFields({ name: 'Genres', value: `${genreNames.join(', ')}`, inline: true });
        }


        if (game.total_rating) {
            embed.addFields({ name: 'Rating', value: `${game.total_rating.toFixed(0)} / 100, ${game.total_rating_count } ratings`, inline: true });
        }

        if (game.franchises) {
            const franchise = await getFranchise(game.franchises);
            embed.addFields({ name: 'Franchise', value: `[${franchise.name}](${franchise.url})`, inline: true });
        }

                const gameTimeToBeat = await getTimeToBeat(game.id);

        if (gameTimeToBeat) {
            const timings = [];

            if (gameTimeToBeat.hastily) {
                const hours = Math.floor(gameTimeToBeat.hastily / 3600);
                timings.push(`Hastily: ${hours}hr`);
            }

            if (gameTimeToBeat.normally) {
                const hours = Math.floor(gameTimeToBeat.normally / 3600);
                timings.push(`Normally: ${hours}hr`);
            }

            if (gameTimeToBeat.completely) {
                const hours = Math.floor(gameTimeToBeat.completely / 3600);
                timings.push(`Completely: ${hours}hr`);
            }

            if (timings.length > 0) {
                embed.addFields({ name: 'Time to Beat', value: `${timings.join('\n')}`, inline: true });
            }
        }

        embed.addFields({ name: 'ID', value: `${game.id}`, inline: true });

        embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });
        embed.setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};