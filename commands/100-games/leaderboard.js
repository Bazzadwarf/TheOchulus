const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboardEntries, getLeaderboardEntriesBetweenDates } = require('../../databaseHelperFunctions.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the leaderboard!')
        .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 })),
    async execute(interaction) {
        await interaction.deferReply();

        const yearOption = interaction.options.getInteger('year');

        let leaderboard;

        if (yearOption) {
            leaderboard = await getLeaderboardEntriesBetweenDates(`${yearOption}-01-01`, `${yearOption}-12-31`);
        }
        else {
            leaderboard = await getLeaderboardEntries();
        }


        if (!leaderboard) return interaction.editReply({ content: 'There was a problem!', ephemeral: true });

        let desc = '';

        let count = 0;

        for (let i = 0; i < leaderboard.length; i++) {

            if (leaderboard[i].count > 0) {
                count += leaderboard[i].count;
            }
        }

        desc = desc.concat('__Total: ', count, '__');

        for (let i = 0; i < leaderboard.length; i++) {

            if (leaderboard[i].count > 0) {
                let newLine = String.prototype.concat(leaderboard[i].username, ' - ', leaderboard[i].count, ' games');

                const number = String.prototype.concat('**#', (i + 1), '** ');

                if (i == 0) newLine = String.prototype.concat('**', newLine, '**');

                if (leaderboard[i].username == interaction.user.username) newLine = String.prototype.concat('*', newLine, '*');

                newLine = String.prototype.concat(number, newLine);

                newLine = String.prototype.concat('\n', newLine);

                desc = String.prototype.concat(desc, newLine);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x6441a5)
            .setTitle('The 100 Games Challenge Leaderboard!')
            .setDescription(desc)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();


        return interaction.editReply({ embeds: [embed] });
    },
};