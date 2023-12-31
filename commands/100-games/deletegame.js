const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, deleteBeatenGameNum, checkGameStorageId, getRecentGameEntry, deleteBeatenGameId, getBeatenGameCount } = require('../../databaseHelperFunctions.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletegame')
        .setDescription('Delete a game that you have beaten from the 100 game challenge!')
        .addNumberOption(option => option.setName('beatgamenumber').setDescription('Index of the game to delete in the list of beaten games.').setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        await interaction.reply({ content: 'Searching for user...', ephemeral: true });

        const beatGameNumber = interaction.options.getNumber('beatgamenumber');

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        let result;

        if (beatGameNumber) {
            result = await deleteBeatenGameNum(beatGameNumber, userDatabaseEntry);
        }
        else {
            const recentGame = await getRecentGameEntry(userDatabaseEntry.id);
            result = await deleteBeatenGameId(recentGame.id, userDatabaseEntry);
        }

        if (result) {
            const gameDatabaseEntry = await checkGameStorageId(result.gameId);
            const body = `where id = ${ gameDatabaseEntry.igdb_id }; fields *;`;
            const res = await getGameJson(body);
            if (!res) return interaction.followUp({ content: 'No game found.', ephemeral: true });
            const game = res[0];

            const num = await getBeatenGameCount(userDatabaseEntry);
            const coverUrl = await getCoverURL(game.cover);

            const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: `${interaction.user.displayName} deleted a game!`, iconURL: interaction.user.avatarURL() })
            .setTitle(`${game.name} deleted!`)
            .setThumbnail(`${coverUrl}`)
            .setDescription(`${interaction.user.displayName} has beaten ${num} games, they have ${100 - num} games remaining.`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

            return interaction.followUp({ embeds: [embed] });
        }

        return interaction.followUp({ content: 'Unable to delete entry / No entry found.', ephemeral: true });
    },
};
