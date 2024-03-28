const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboardEntries } = require('../../databaseHelperFunctions.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the leaderboard!'),
    async execute(interaction) {
        const leaderboard = await getLeaderboardEntries();
        await interaction.deferReply();

        if (!leaderboard) return interaction.editReply({ content: 'There was a problem!', ephemeral: true });

        await leaderboard.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        let desc = '';

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