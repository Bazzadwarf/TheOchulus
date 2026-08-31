const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getPlanningGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('plannedgames')
    .setDescription('Show the list of games you are currently planning to play.')
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

        const databaseEntries = await getPlanningGames(userDatabaseEntry.id);
        let desc = '';

        if (!databaseEntries || databaseEntries.length == 0) {
            desc = `${user.displayName} currently has no planned games.`;
        } else {
            desc = desc.concat('__Total: ', databaseEntries.length, '__\n');

            for (let i = 0; i < databaseEntries.length; i++) {
                const game = await checkGameStorageId(databaseEntries[i].gameId);
                desc = desc.concat('**#', (i + 1), '** ', game.name, '\n');
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.displayName}'s Planned Games`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};