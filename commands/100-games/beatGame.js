const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');
const { checkGameStorage, getUserRegistration, createBeatenGameEntry, getBeatenGameCount, getPlanningGameCount, getPlayingGameCount } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('beatgame')
        .setDescription('Log a game that you have beat towards the 100 game challenge!')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.').setRequired(true))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0)),
    async execute(interaction) {

        await interaction.reply({ content: 'Attempting to log game.', ephemeral: true });

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        if (!userDatabaseEntry) return interaction.followUp({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });

        const oldnum = await getBeatenGameCount(userDatabaseEntry);
        if (oldnum >= 100) return interaction.followUp({ content: 'You have already completed the 100 Games Challenge.', ephemeral: true });

        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');

        if (!gamename && !gameid) return interaction.followUp({ content: 'No gamename or gameid supplied, please supply an option to register a game!', ephemeral: true });

        let body = '';

        if (gameid) {
            body = body.concat('where id = ', gameid, '; ');
        } else if (gamename) {
            body = body.concat('search "', gamename, '"; ');
            body = body.concat('limit 25; where (category = 0 | category = 4 | category = 8 | category = 9) & version_parent = null;');
        }

        body = body.concat('fields *;');

        let res = await getGameJson(body);
        res = res.filter(entry => entry.status !== 6);
        res.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        if (!res[0]) return interaction.followUp({ content: 'No game found for the options supplied.', ephemeral: true });

        const game = res[0];
        const release_date = game.first_release_date;
        if (!release_date || (release_date * 1000) > Date.now()) return interaction.followUp({ content: `${game.name} is not yet released.`, ephemeral: true });

        const gameDatabaseEntry = await checkGameStorage(game);

        if (!(await createBeatenGameEntry(userDatabaseEntry, gameDatabaseEntry))) return interaction.followUp({ content: `${game.name} already beaten.`, ephemeral: true });

        const beatNum = await getBeatenGameCount(userDatabaseEntry);
        const planNum = await getPlanningGameCount(userDatabaseEntry);
        const playNum = await getPlayingGameCount(userDatabaseEntry);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setAuthor({ name: `${interaction.user.displayName} beat a new game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${game.name} beaten!`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        if (game.cover) {
            const coverUrl = await getCoverURL(game.cover);
            embed.setThumbnail(`${coverUrl}`);
        }

        embed.addFields({ name: 'Planned', value: `${planNum} game(s)`, inline: true });
        embed.addFields({ name: 'Now Playing', value: `${playNum} game(s)`, inline: true });
        embed.addFields({ name: 'Beaten', value: `${beatNum}/100 (${100 - beatNum} game(s) remaining)`, inline: true });

        await interaction.followUp({ embeds: [embed] });

        if (beatNum == 100) {
            const challengeCompletedEmbed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setAuthor({ name: `${interaction.user.displayName} has completed the 100 Game Challenge!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`Congratulations ${interaction.user.displayName}, you have completed the 100 Game Challenge!`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp()
            .setImage('https://c.tenor.com/82zAqfFm7OMAAAAC/tenor.gif');

            await interaction.followUp({ embeds: [challengeCompletedEmbed] });
        }
    },
};