const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getBeatenGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('beatlist')
    .setDescription('Show the list of games you have beaten.')
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

        const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);
        let desc = '';

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
            desc = `${user.displayName} has not beaten any games yet.`;
        } else {
            desc = desc.concat('__Total: ', beatenGamesDatabaseEntries.length, '/100__\n');

            for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
                const game = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
                const date = beatenGamesDatabaseEntries[i].statusLastChanged.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
                desc = desc.concat('**#', (i + 1), ' (', date, ')**: ', game.name, '\n');
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.displayName}'s Beaten Games`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};