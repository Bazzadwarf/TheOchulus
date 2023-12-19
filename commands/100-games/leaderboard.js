const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboardEntries } = require('../../databaseHelperFunctions.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the leaderboard!'),
    async execute(interaction) {
        const leaderboard = await getLeaderboardEntries();

        if (!leaderboard) return interaction.reply('There was a problem!');

        await leaderboard.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        let desc = '';

        for (let i = 0; i < leaderboard.length; i++) {
            let newLine = '';
            newLine = newLine.concat((i + 1), '. \t', leaderboard[i].username, ' - ', leaderboard[i].count, ' games\n');
            desc = desc.concat(newLine);
        }

        const embed = new EmbedBuilder()
            .setColor(0x6441a5)
            .setTitle('The 100 Games Challenge Leaderboard!')
            .setDescription(desc)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();


        return interaction.reply({ embeds: [embed] });
    },
};