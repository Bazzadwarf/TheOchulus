const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, deletePlanningGameNum, checkGameStorageId, getRecentPlanningGameEntry, deletePlanningGameId, getPlayingGameCount, getBeatenGameCount, getPlanningGameCount, getPlanningGames } = require('../../databaseHelperFunctions.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteplannedgame')
        .setDescription('Delete a game that you were planning to play!')
        .addNumberOption(option => option.setName('currentgamenumber').setDescription('Index of the game to delete in the list of planned games.').setMinValue(1))
        .addBooleanOption(option => option.setName('deleteallgames').setDescription('Deletes all the games currently planned.')),
    async execute(interaction) {
        await interaction.deferReply();

        const beatGameNumber = interaction.options.getNumber('currentgamenumber');
        const deleteAllGames = interaction.options.getBoolean('deleteallgames');

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        let result;

        if (deleteAllGames) {
            const databaseEntries = await getPlanningGames(userDatabaseEntry.id);

            for (let i = databaseEntries.length; i > 0; i--) {
                await deletePlanningGameNum(i, userDatabaseEntry);
            }

            const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: `${interaction.user.displayName} deleted all planned games!`, iconURL: interaction.user.avatarURL() })
            .setTitle('Everything deleted!')
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

            const beatNum = await getBeatenGameCount(userDatabaseEntry);
            const planNum = await getPlanningGameCount(userDatabaseEntry);
            const playNum = await getPlayingGameCount(userDatabaseEntry);

            embed.addFields({ name: 'Planned', value: `${planNum} game(s)`, inline: true });
            embed.addFields({ name: 'Now Playing', value: `${playNum} game(s)`, inline: true });
            embed.addFields({ name: 'Beaten', value: `${beatNum}/100 (${100 - beatNum} game(s) remaining)`, inline: true });

            return interaction.editReply({ embeds: [embed] });
        }

        if (beatGameNumber) {
            result = await deletePlanningGameNum(beatGameNumber, userDatabaseEntry);
        }
        else {
            const recentGame = await getRecentPlanningGameEntry(userDatabaseEntry.id);
            result = await deletePlanningGameId(recentGame.id, userDatabaseEntry);
        }

        if (result) {
            const gameDatabaseEntry = await checkGameStorageId(result.gameId);
            const body = `where id = ${ gameDatabaseEntry.igdb_id }; fields *;`;
            const res = await getGameJson(body);
            if (!res) return interaction.editReply({ content: 'No game found.', ephemeral: true });
            const game = res[0];

            const beatNum = await getBeatenGameCount(userDatabaseEntry);
            const planNum = await getPlanningGameCount(userDatabaseEntry);
            const playNum = await getPlayingGameCount(userDatabaseEntry);

            const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: `${interaction.user.displayName} deleted a game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${game.name} deleted!`)
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

            return interaction.editReply({ embeds: [embed] });
        }

        return interaction.editReply({ content: 'Unable to delete entry / No entry found.', ephemeral: true });
    },
};
