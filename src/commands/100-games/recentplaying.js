const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../helpers/igdb.js');
const { getUserRegistration, getBeatenGameCount, getPlanningGameCount, getPlayingGameCount, getRecentPlayingLoggedGameEntry, checkGameStorageId } = require('../../helpers/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recentplaying')
        .setDescription('Get the most recent game you have started playing.')
        .addUserOption(option => option.setName('user').setDescription('The user to check')),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user') ?? interaction.user;

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });

        const loggedGameEntry = await getRecentPlayingLoggedGameEntry(userDatabaseEntry);
        if (!loggedGameEntry) return interaction.editReply({ content: 'No game found.', ephemeral: true });

        const gameDatabaseEntry = await checkGameStorageId(loggedGameEntry.gameId);
        if (!gameDatabaseEntry) return interaction.editReply({ content: 'No game found.', ephemeral: true });

        const body = `where id = ${ gameDatabaseEntry.igdb_id }; fields *;`;
        const res = await getGameJson(body);
        if (!res?.length) return interaction.editReply({ content: 'No game found on igdb.', ephemeral: true });

        const game = res[0];

        const [beatNum, planNum, playNum] = await Promise.all([
            getBeatenGameCount(userDatabaseEntry),
            getPlanningGameCount(userDatabaseEntry),
            getPlayingGameCount(userDatabaseEntry),
        ]);

        const embed = new EmbedBuilder();
        embed.setColor(0x00C921);
        embed.setAuthor({ name: `${user.displayName}'s most recent playing game`, iconURL: user.avatarURL() });
        embed.setTitle(game.name);
        embed.setURL(game.url);
        embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });
        embed.setTimestamp(loggedGameEntry.statusLastChanged);

        if (game.cover) {
            const coverUrl = await getCoverURL(game.cover);
            embed.setThumbnail(`${coverUrl}`);
        }

        embed.addFields({ name: 'Planned', value: `${planNum} game${planNum !== 1 ? 's' : ''}`, inline: true });
        embed.addFields({ name: 'Now Playing', value: `${playNum} game${playNum !== 1 ? 's' : ''}`, inline: true });
        embed.addFields({ name: 'Beaten', value: `${beatNum} game${beatNum !== 1 ? 's' : ''} *(${100 - beatNum} game${100 - beatNum !== 1 ? 's' : ''} remaining)*`, inline: true });

        return interaction.editReply({ embeds: [embed] });
    },
};