const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, deletePlayingGameNum, checkGameStorageId, getRecentPlayingGameEntry, deletePlayingGameId, getPlayingGameCount, getBeatenGameCount, getPlanningGameCount } = require('../../databaseHelperFunctions.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteplayinggame')
        .setDescription('Delete a game that you was playing!')
        .addNumberOption(option => option.setName('currentgamenumber').setDescription('Index of the game to delete in the list of currently playing games.').setMinValue(1)),
    async execute(interaction) {
        await interaction.deferReply();

        const beatGameNumber = interaction.options.getNumber('currentgamenumber');

        const userDatabaseEntry = await getUserRegistration(interaction.user);
        let result;

        if (beatGameNumber) {
            result = await deletePlayingGameNum(beatGameNumber, userDatabaseEntry);
        }
        else {
            const recentGame = await getRecentPlayingGameEntry(userDatabaseEntry.id);
            result = await deletePlayingGameId(recentGame.id, userDatabaseEntry);
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
