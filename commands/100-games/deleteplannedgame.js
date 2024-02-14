const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, deletePlanningGameNum, checkGameStorageId, getRecentPlanningGameEntry, deletePlanningGameId, getPlayingGameCount, getBeatenGameCount, getPlanningGameCount } = require('../../databaseHelperFunctions.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteplannedgame')
        .setDescription('Delete a game that you were planning to play!')
        .addNumberOption(option => option.setName('currentgamenumber').setDescription('Index of the game to delete in the list of planned games.').setMinValue(1)),
    async execute(interaction) {
        await interaction.reply({ content: 'Searching for user...', ephemeral: true });

        const beatGameNumber = interaction.options.getNumber('currentgamenumber');

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        let result;

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
            if (!res) return interaction.followUp({ content: 'No game found.', ephemeral: true });
            const game = res[0];

            const beatNum = await getBeatenGameCount(userDatabaseEntry);
            const planNum = await getPlanningGameCount(userDatabaseEntry);
            const playNum = await getPlayingGameCount(userDatabaseEntry);

            const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: `${interaction.user.displayName} deleted a game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${game.name} deleted!`)
            .setDescription(`${interaction.user.displayName} has ${planNum} games planned, they are playing ${playNum} games, they have beaten ${beatNum} games, they have ${100 - beatNum} games remaining.`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

            if (game.cover) {
                const coverUrl = await getCoverURL(game.cover);
                embed.setThumbnail(`${coverUrl}`);
            }

            return interaction.followUp({ embeds: [embed] });
        }

        return interaction.followUp({ content: 'Unable to delete entry / No entry found.', ephemeral: true });
    },
};
