const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllBeatenGamesBetweenDates, checkGameStorageId, getUserFromId } = require('../../databaseHelperFunctions.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('globalbeatlist')
    .setDescription('Show a list of all games beaten for the 100 games challenge in chronological order.')
    .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 })),
    async execute(interaction) {
        await interaction.deferReply();

        const yearOption = interaction.options.getInteger('year');
        const start = (yearOption) ? new Date(yearOption, 0, 1) : new Date(2024, 0, 1);
        const end = (yearOption) ? new Date(yearOption, 11, 31) : new Date();

        let beatenGamesDatabaseEntries = await getAllBeatenGamesBetweenDates(start, end);
        let desc = '';

        desc = desc.concat('__Total: ', beatenGamesDatabaseEntries.length, '__\n');

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
            desc = 'No games beaten yet.';
        } else {
            beatenGamesDatabaseEntries = beatenGamesDatabaseEntries.reverse();
            for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
                const game = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
                const userentry = await getUserFromId(beatenGamesDatabaseEntries[i].userId);
                const date = beatenGamesDatabaseEntries[i].statusLastChanged.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
                const newDesc = String.prototype.concat('**', date, '**: \t', game.name, ' \t*(', userentry.username, ')*\n');

                if (newDesc.length + desc.length < 4096) {
                    desc = desc.concat(newDesc);
                }
                else {
                    i = beatenGamesDatabaseEntries.length;
                }
            }
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(interaction.client.user.avatarURL())
        .setTitle('The 100 Games Challenge Global Beat List')
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};