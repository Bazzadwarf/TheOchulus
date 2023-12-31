const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('beatlist')
    .setDescription('Show the list of games you have beaten.')
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

        const beatenGamesDatabaseEntries = await getGames(userDatabaseEntry.id);
        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) return interaction.followUp({ content: 'No games found.', ephemeral: true });

        let desc = '';

        for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
            const gameid = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
            const res = await getGameJson(`where id = ${ gameid.igdb_id }; fields *;`);
            const game = res[0];

            desc = desc.concat('#', (i + 1), ' \t', game.name, '\n');
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setAuthor({ name: `${user.displayName}`, iconURL: user.avatarURL() })
        .setTitle(`${interaction.user.username}'s beaten games`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    },
};