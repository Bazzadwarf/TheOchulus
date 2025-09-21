const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGameJson } = require('../../igdbHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('searchgames')
		.setDescription('Searches the igdb database for matching games.')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game').setRequired(true)),

	async execute(interaction) {
        const gamename = interaction.options.getString('gamename');
        await interaction.deferReply();

        let games = await searchGamesWithMinimumReview(gamename);

        if (games.length == 0) games = await searchGamesWithoutMinimumReview(gamename);
        let description = '';

        if (games.length == 0) {
            description = 'No games found.';

            const embed = new EmbedBuilder()
            .setTitle(`"${gamename}" Search Results`)
            .setDescription(`${description.slice(0, 1998)}`)
            .setColor(0x6441a5);

            return await interaction.editReply({ embeds: [embed] });
        }

        await games.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));


        for (const game of games) {
            if (game.first_release_date && (game.category == 0 || game.category == 4 || game.category == 8 || game.category == 9)) {
                const release_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(game.first_release_date * 1000);
                description = description.concat(`- **${game.name}** (*${release_date}*) - ID: ${game.id} \n`);
            }
        }

        if (description == '') description = 'No games found.';

        const embed = new EmbedBuilder()
            .setTitle(`"${gamename}" Search Results`)
            .setDescription(`${description.slice(0, 1998)}`)
            .setColor(0x6441a5);

        await interaction.editReply({ embeds: [embed] });
	},
};

async function searchGamesWithMinimumReview(gamename) {
    let body = `search "${gamename}"; `;
    body = await body.concat('fields *; limit 25; where version_parent = null & total_rating_count > 0;');

    const games = await getGameJson(body);

    return games;
}

async function searchGamesWithoutMinimumReview(gamename) {
    let body = `search "${gamename}"; `;
    body = await body.concat('fields *; limit 25; where version_parent = null;');

    const games = await getGameJson(body);

    return games;
}