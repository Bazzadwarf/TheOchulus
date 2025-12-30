const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getBeatenGames, checkGameStorageId, getBeatenGamesForYear } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('beatlist')
    .setDescription('Show the list of games you have beaten.')
    .addUserOption(option => option.setName('user').setDescription('The user to check'))
    .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 })),
    async execute(interaction) {
        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');
        const yearOption = interaction.options.getInteger('year');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

        let beatenGamesDatabaseEntries;

        if (yearOption) {
            const start = new Date(yearOption, 0, 1);
            const end = new Date(yearOption, 11, 31);
            beatenGamesDatabaseEntries = await getBeatenGamesForYear(userDatabaseEntry.id, start, end);
        } else {
            beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);
        }

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