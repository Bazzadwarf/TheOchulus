const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');
const { getUserRegistration, getRecentPlanningGameEntry, getBeatenGameCount, getPlanningGameCount, getPlayingGameCount } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recentplanned')
        .setDescription('Get the most recent game you have planned.')
        .addUserOption(option => option.setName('user').setDescription('The user to check')),
    async execute(interaction) {
        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });

        const gameDatabaseEntry = await getRecentPlanningGameEntry(userDatabaseEntry.id);
        if (!gameDatabaseEntry) return interaction.editReply({ content: 'No game found.', ephemeral: true });

        const body = `where id = ${ gameDatabaseEntry.igdb_id }; fields *;`;
        const res = await getGameJson(body);
        if (!res) return interaction.editReply({ content: 'No game found.', ephemeral: true });
        const game = res[0];

        const beatNum = await getBeatenGameCount(userDatabaseEntry);
        const planNum = await getPlanningGameCount(userDatabaseEntry);
        const playNum = await getPlayingGameCount(userDatabaseEntry);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setAuthor({ name: `${user.displayName}'s most recent planned game`, iconURL: user.avatarURL() })
            .setTitle(game.name)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        if (game.cover) {
            const coverUrl = await getCoverURL(game.cover);
            embed.setThumbnail(`${coverUrl}`);
        }

        embed.addFields({ name: 'Planned', value: `${planNum} game(s)`, inline: true });
        embed.addFields({ name: 'Now Playing', value: `${playNum} game(s)`, inline: true });
        embed.addFields({ name: 'Beaten', value: `${beatNum}/100 (${100 - beatNum} game(s) remaining)`, inline: true });

        return interaction.editReply({ embeds: [embed] });
    },
};