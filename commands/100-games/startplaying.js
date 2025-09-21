const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');
const { checkGameStorage, getUserRegistration, createPlayingGameEntry, getBeatenGameCount, getPlanningGameCount, getPlayingGameCount } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startplaying')
        .setDescription('Log a game that you have started playing towards the 100 game challenge!')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game.').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('The date to be logged. (YYYY/MM/DD)'))
        .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0)),
    async execute(interaction) {

        await interaction.deferReply();

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });

        const gamename = interaction.options.getString('gamename');
        const gameid = interaction.options.getNumber('gameid');
        const date = interaction.options.getString('date');

        if (!gamename && !gameid) return interaction.editReply({ content: 'No gamename or gameid supplied, please supply an option to register a game!', ephemeral: true });

        let body = '';

        if (gameid) {
            body = body.concat('where id = ', gameid, '; ');
        } else if (gamename) {
            body = body.concat('search "', gamename, '"; ');
            body = body.concat('limit 25; where version_parent = null;');
        }

        body = body.concat('fields *;');

        let res = await getGameJson(body);
        res = res.filter(entry => entry.status !== 6);
        res.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        if (!res[0]) return interaction.editReply({ content: 'No game found for the options supplied.', ephemeral: true });

        const game = res[0];
        const release_date = game.first_release_date;
        if (!release_date || (release_date * 1000) > Date.now()) return interaction.editReply({ content: `${game.name} is not yet released.`, ephemeral: true });

        const gameDatabaseEntry = await checkGameStorage(game);

        let gameDate = new Date();

        if (date) {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                gameDate = parsedDate;
            }
            else {
                gameDate = new Date();
            }
        }

        await createPlayingGameEntry(userDatabaseEntry, gameDatabaseEntry, gameDate);

        const beatNum = await getBeatenGameCount(userDatabaseEntry);
        const planNum = await getPlanningGameCount(userDatabaseEntry);
        const playNum = await getPlayingGameCount(userDatabaseEntry);

        const embed = new EmbedBuilder()
            .setColor(0x00C921)
            .setAuthor({ name: `${interaction.user.displayName} has started playing a new game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${game.name}!`)
            .setURL(game.url)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        embed.addFields({ name: 'Planned', value: `${planNum} game(s)`, inline: true });
        embed.addFields({ name: 'Now Playing', value: `${playNum} game(s)`, inline: true });
        embed.addFields({ name: 'Beaten', value: `${beatNum}/100 (${100 - beatNum} game(s) remaining)`, inline: true });

        if (game.cover) {
            const coverUrl = await getCoverURL(game.cover);
            embed.setThumbnail(`${coverUrl}`);
        }

        await interaction.editReply({ embeds: [embed] });
    },
};