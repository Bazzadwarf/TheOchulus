const { SlashCommandBuilder } = require('discord.js');
const { deleteBeatenGameId, getUserRegistration, deleteBeatenGameNum, checkGameStorageId } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletegameentry')
        .setDescription('Delete a game that you have beaten from the 100 game challenge!')
        .addNumberOption(option => option.setName('databaseentryid').setDescription('The beat game id.').setMinValue(1))
        .addNumberOption(option => option.setName('beatgamenumber').setDescription('Index of the game to delete in the list of beaten games.').setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const databaseEntryId = interaction.options.getNumber('databaseentryid');
        const beatGameNumber = interaction.options.getNumber('beatgamenumber');

        if (!databaseEntryId && !beatGameNumber) return interaction.reply({ content: 'No parameters supplied.', ephemeral: true });

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        let result;
        if (databaseEntryId) {
            result = await deleteBeatenGameId(databaseEntryId, userDatabaseEntry);
        } else if (beatGameNumber) {
            result = await deleteBeatenGameNum(beatGameNumber, userDatabaseEntry);
        }

        if (result) {
            const game = await checkGameStorageId(result.gameId);
            return interaction.reply(`${game.name} successfully deleted`);
        }

        return interaction.reply({ content: 'Unable to delete entry / No entry found.', ephemeral: true });
    },
};