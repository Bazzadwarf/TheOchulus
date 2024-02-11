const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCoverURL, getGameJson } = require('../../igdbHelperFunctions.js');
const { getUserRegistration, getRecentBeatenGameEntry, getBeatenGameCount } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recentbeat')
        .setDescription('Get the most recent game you have beat.')
        .addUserOption(option => option.setName('user').setDescription('The user to check')),
    async execute(interaction) {
        let user = interaction.user;
        const userOption = interaction.options.getUser('user');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.reply({ content: `Issue checking registration with "${interaction.user.username}".`, ephemeral: true });

        const gameDatabaseEntry = await getRecentBeatenGameEntry(userDatabaseEntry.id);
        if (!gameDatabaseEntry) return interaction.reply({ content: 'No game found.', ephemeral: true });

        const body = `where id = ${ gameDatabaseEntry.igdb_id }; fields *;`;
        const res = await getGameJson(body);
        if (!res) return interaction.reply({ content: 'No game found.', ephemeral: true });
        const game = res[0];

        const coverUrl = await getCoverURL(game.cover);
        const num = await getBeatenGameCount(userDatabaseEntry);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setAuthor({ name: `${user.displayName}'s most recent beat game!`, iconURL: user.avatarURL() })
            .setTitle(game.name)
            .setThumbnail(`${coverUrl}`)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp()
            .setDescription(`${interaction.user.displayName} has beaten ${num} games, they have ${100 - num} games remaining.`);

        return interaction.reply({ embeds: [embed] });
    },
};