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

        for (let i = 0; i < changelogEntries.length; i++) {
            let newDesc = '';
            const game = await checkGameStorageId(changelogEntries[i].gameId);

            if (changelogEntries[i].newStatus == 'planning') {
                newDesc = `:pencil: planned **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (changelogEntries[i].newStatus == 'playing') {
                newDesc = `:video_game: started playing **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (changelogEntries[i].newStatus == 'beat') {
                newDesc = `:white_check_mark: beat **${game.name}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            } else if (!changelogEntries[i].newStatus) {
                newDesc = `:x: deleted **${game.name}** from **${changelogEntries[i].oldStatus}** *(${changelogEntries[i].createdAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')})*\n`;
            }

            if (newDesc.length + desc.length < 2000) {
                desc = desc.concat(newDesc);
            }
            else {
                i = changelogEntries.length;
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