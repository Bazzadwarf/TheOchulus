const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getChangelog, checkGameStorageId } = require('../../databaseHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('changelog')
	.setDescription('Show your recent activity')
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

        const changelogEntries = await getChangelog(userDatabaseEntry.id);
        let desc = '';

        for (const entry of changelogEntries) {
            const game = await checkGameStorageId(entry.gameId);

            if (entry.oldStatus && entry.newStatus) {
                // Status changed
                desc = desc.concat(`:arrow_right: moved **${game.name}** from **${entry.oldStatus}** to **${entry.newStatus}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            } else if (!entry.oldStatus && entry.newStatus) {
                // Created entry
                desc = desc.concat(`:white_check_mark: added **${game.name}** to **${entry.newStatus}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            } else if (entry.oldStatus && !entry.newStatus) {
                // Deleted Entry
                desc = desc.concat(`:x: deleted **${game.name}** from **${entry.oldStatus}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.displayName}'s Changelog`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
	},
};