const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getBeatenGameCount, getPlanningGameCount, getPlayingGameCount, getRecentBeatenGameEntry, getBeatenGames, getRecentEntry } = require('../../databaseHelperFunctions');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Get the users info for the 100 Game Challenge')
    .addUserOption(option => option.setName('user').setDescription('The user to check')),
    async execute(interaction) {
        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

        const planNum = await getPlanningGameCount(userDatabaseEntry);
        const playNum = await getPlayingGameCount(userDatabaseEntry);
        const beatNum = await getBeatenGameCount(userDatabaseEntry);
        const gameDatabaseEntry = await getRecentBeatenGameEntry(userDatabaseEntry.id);
        const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);
        const recentEntry = await getRecentEntry(userDatabaseEntry.id);

        const embed = new EmbedBuilder();
        embed.setColor(0x6441a5);
        embed.setTitle(`User Info for ${user.displayName}`);
        embed.setThumbnail(user.avatarURL());
        embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });

        if (planNum >= 0) embed.addFields({ name: 'Planned', value: `${planNum} game(s)`, inline: true });
        if (playNum >= 0) embed.addFields({ name: 'Now Playing', value: `${playNum} game(s)`, inline: true });
        if (beatNum >= 0) embed.addFields({ name: 'Beaten', value: `${beatNum}/100 (${100 - beatNum} game(s) remaining)`, inline: true });
        if (gameDatabaseEntry) embed.addFields({ name: 'Last Beat Game', value: `${gameDatabaseEntry.name}`, inline: true });

        if (beatenGamesDatabaseEntries && beatenGamesDatabaseEntries.length > 0) {
            const today = new Date();
            const start = new Date(2024, 0, 1);
            const days = (today - start) / (1000 * 60 * 60 * 24);
            const timepergame = days / beatenGamesDatabaseEntries.length;
            embed.addFields({ name: 'Average Beat Interval', value: `${Math.round(timepergame)} days`, inline: true });
            const finishdate = new Date();
            finishdate.setDate(start.getDate() + (timepergame * 100));
            const date = finishdate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
            embed.addFields({ name: 'Estimated Finish Date', value: `${date}`, inline: true });
        }

        if (recentEntry) embed.addFields({ name: 'Last Updated', value: `${recentEntry.updatedAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}`, inline: true });

        return interaction.editReply({ embeds: [embed] });
    },
};