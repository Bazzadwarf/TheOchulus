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

        for (let i = 0; i < changelogEntries.length; i++) {
            let newDesc = '';
            const game = await checkGameStorageId(changelogEntries[i].gameId);
            const user = await getUserFromId(changelogEntries[i].userId);

            if (changelogEntries[i].newStatus == 'planning') {
                newDesc = `:pencil: *${user.username}* planned **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (changelogEntries[i].newStatus == 'playing') {
                newDesc = `:video_game: *${user.username}* started playing **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (changelogEntries[i].newStatus == 'beat') {
                newDesc = `:white_check_mark: *${user.username}* beat **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (!changelogEntries[i].newStatus) {
                newDesc = `:x: *${user.username}* deleted **${game.name}** from **${changelogEntries[i].oldStatus}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            }

            if (newDesc.length + desc.length < 4096) {
                desc = desc.concat(newDesc);
            }
            else {
                i = changelogEntries.length;
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