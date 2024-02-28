const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getPlanningGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('plannedgames')
    .setDescription('Show the list of games you are currently planning to play.')
    .addUserOption(option => option.setName('user').setDescription('The user to check')),
    async execute(interaction) {
        await interaction.reply({ content: 'Searching for user...', ephemeral: true });

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.followUp({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

        const databaseEntries = await getPlanningGames(userDatabaseEntry.id);
        let desc = '';

        if (!databaseEntries || databaseEntries.length == 0) {
            desc = `${user.displayName} currently has no planned games.`;
        } else {
            desc = desc.concat('__Total: ', databaseEntries.length, '__\n\n');

            for (let i = 0; i < databaseEntries.length; i++) {
                const gameid = await checkGameStorageId(databaseEntries[i].gameId);
                const res = await getGameJson(`where id = ${ gameid.igdb_id }; fields *;`);
                const game = res[0];
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

        return interaction.followUp({ embeds: [embed] });
    },
};