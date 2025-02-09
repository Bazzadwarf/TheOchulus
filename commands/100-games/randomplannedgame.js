const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getPlanningGames, checkGameStorageId } = require('../../databaseHelperFunctions');
const { getGameJson, getCoverURL } = require('../../igdbHelperFunctions');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('randomplannedgame')
    .setDescription('Get a random planned game')
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

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setAuthor({ name: `${user.displayName}'s Random Planned Game`, iconURL: user.avatarURL() })
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });

        const plannedGames = await getPlanningGames(userDatabaseEntry.id);
        let desc = '';

        if (!plannedGames || plannedGames.length == 0) {
            desc = `${user.displayName} currently has no planned games.`;
        } else {
            const randomInt = Math.floor(Math.random() * (plannedGames.length));
            const randomEntry = plannedGames[randomInt];
            const randomGame = await checkGameStorageId(randomEntry.gameId);
            const body = `where id = ${ randomGame.igdb_id }; fields *;`;
            const res = await getGameJson(body);
            if (!res) return interaction.editReply({ content: 'No game found.', ephemeral: true });
            const game = res[0];

            embed.setTitle('THE OCHULUS HAS SPOKEN');
            if (game.cover) {
                const coverUrl = await getCoverURL(game.cover);
                embed.setThumbnail(`${coverUrl}`);
            }
            desc = `It has chosen **[${game.name}](${game.url})**, glory be to The Ochulus!`;
        }

        embed.setDescription(desc);
        return interaction.editReply({ embeds: [embed] });
    },
};