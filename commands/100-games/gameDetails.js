const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson, getCompanyInfo, getGenres, getFranchise, getReleaseDates } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamedetails')
        .setDescription('Get the details of a given game.')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0)),

        async execute(interaction) {
        await interaction.deferReply();

        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');

        if (!gamename && !gameid) return interaction.editReply({ content: 'No gamename or gameid supplied, please supply an option to register a game!', ephemeral: true });

        let body = '';

        if (gameid) {
            body = body.concat('where id = ', gameid, '; ');
            body = body.concat('fields *;');
        } else if (gamename) {
            body = body.concat('search "', gamename, '"; ');
            body = body.concat('fields *; limit 25; where (category = 0 | category = 4) & version_parent = null;');
        }

        const games = await getGameJson(body);

        if (!games[0]) return interaction.followUp({ content: 'No game found.', ephemeral: true });

        await games.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        const game = games[0];

        const coverUrl = await getCoverURL(game.cover);

        let release_date;
        if (game.first_release_date) {
            release_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(game.first_release_date * 1000);
        } else if (game.release_dates) {
            release_date = await getReleaseDates(game.release_dates[0]);
        } else {
            release_date = 'To be announced';
        }

        const genres = [];
        if (game.genres)
        {
            for (const genreId of game.genres) {
            const genre = await getGenres(genreId);
            genres.push(genre);
            }
        }

        // Build Embed
        const embed = new EmbedBuilder();
        embed.setColor(0x6441a5);
        embed.setTitle(`${game.name}`);
        embed.setURL(`${game.url}`);

        if (game.cover) {
            embed.setThumbnail(`${coverUrl}`);
        }

        if (game.summary) {
            embed.addFields({ name: 'Description', value: `${game.summary.length > 1024 ? game.summary.substring(0, 1024) : game.summary}` });
        }

        if (game.involved_companies) {
            const developers = [];
            const publishers = [];

            for (const company of game.involved_companies) {
                const info = await getCompanyInfo(company);

                if (info.developed)
                {
                    if (info.developed.find(item => item === game.id)) {
                        developers.push(info.name);
                    }
                }


                if (info.published)
                {
                    if (info.published.find(item => item === game.id)) {
                        publishers.push(info.name);
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

        embed.addFields({ name: 'Release Date', value: `${release_date}`, inline: true });

        if (genres.length > 0)
        {
            embed.addFields({ name: 'Genres', value: `${genres.join(', ')}`, inline: true });
        }

        if (game.total_rating) {
            embed.addFields({ name: 'Rating', value: `${game.total_rating.toFixed(0)} / 100, ${game.total_rating_count } ratings`, inline: true });
        }

        embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });
        embed.setTimestamp();

        if (game.franchises) {
            const franchise = await getFranchise(game.franchises);
            embed.addFields({ name: 'Franchise', value: `${franchise}`, inline: true });
        }

        embed.addFields({ name: 'ID', value: `${game.id}`, inline: true });

        return interaction.followUp({ embeds: [embed] });
    },
};