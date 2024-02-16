const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getBeatenGames } = require('../../databaseHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('estimatedfinishdate')
    .setDescription('Get an estimated date as to when a user will finish the 100 games challenge.')
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

        const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);
        let desc = '';

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
            desc = `${user.displayName} has not beaten any games yet.`;
        } else {
            const today = new Date();
            const start = new Date(2024, 1, 1);
            const days = (today - start) / (1000 * 3600 * 24);
            const timepergame = days / beatenGamesDatabaseEntries.length;
            const finishdate = new Date();
            finishdate.setDate(start.getDate() + (timepergame * 100));
            const formatteddate = finishdate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
            desc = `${user.displayName} is estimated to finish the 100 Games Challenge on **${formatteddate}**.`;
        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setAuthor({ name: `${user.displayName}`, iconURL: user.avatarURL() })
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.displayName}'s Estimated Finish Date`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.followUp({ embeds: [embed] });
    },
};