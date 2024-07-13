const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllChangelog, checkGameStorageId, getUserFromId } = require('../../databaseHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('globalchangelog')
	.setDescription('Show all recent activity'),
	async execute(interaction) {
		await interaction.deferReply();
        const changelogEntries = await getAllChangelog();
        let desc = '';

        for (const entry of changelogEntries) {
            const game = await checkGameStorageId(entry.gameId);
            const user = await getUserFromId(entry.userId);

            if (entry.newStatus == 'planning') {
                desc = desc.concat(`:pencil: *${user.username}* planned **${game.name}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            } else if (entry.newStatus == 'playing') {
                desc = desc.concat(`:video_game: *${user.username}* started playing **${game.name}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            } else if (entry.newStatus == 'beat') {
                desc = desc.concat(`:white_check_mark: *${user.username}* beat **${game.name}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            } else if (!entry.newStatus) {
                desc = desc.concat(`:x: *${user.username}* deleted **${game.name}** from **${entry.oldStatus}** *(${entry.createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`);
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(interaction.client.user.avatarURL())
        .setTitle('Global Changelog')
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
	},
};