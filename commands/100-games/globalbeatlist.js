const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllBeatenGames, checkGameStorageId, getUserFromId } = require('../../databaseHelperFunctions.js');
const { getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('globalbeatlist')
    .setDescription('Show a list of all games beaten for the 100 games challenge in chronological order.'),
    async execute(interaction) {
        await interaction.reply({ content: 'Searching for games...', ephemeral: true });

        const user = interaction.user;

        const beatenGamesDatabaseEntries = await getAllBeatenGames();
        let desc = '';

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
            desc = 'No games beaten yet.';
        } else {
            for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
                const gameid = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
                const res = await getGameJson(`where id = ${ gameid.igdb_id }; fields *;`);
                const game = res[0];
                const userentry = await getUserFromId(beatenGamesDatabaseEntries[i].userId);
                const date = beatenGamesDatabaseEntries[i].updatedAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
                desc = desc.concat('**', date, '**: \t', game.name, ' \t*(', userentry.username, ')*\n');
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setAuthor({ name: `${user.displayName}`, iconURL: user.avatarURL() })
        .setThumbnail(interaction.client.user.avatarURL())
        .setTitle('Global Beat List')
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    },
};