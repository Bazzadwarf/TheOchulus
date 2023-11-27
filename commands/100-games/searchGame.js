const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('searchgame')
		.setDescription('Searches the igdb database for matching games.')
        .addStringOption(option => option.setName('gamename').setDescription('The name of the game').setRequired(true)),

	async execute(interaction) {
        const gamename = interaction.options.getString('gamename');
        await interaction.reply(`Searching for ${gamename}...`);

        let body = `search "${gamename}"; `;
        body = await body.concat('fields *; limit 25; where (category = 0 | category = 4) & version_parent = null;');

        const games = await getGameJson(body);

        await games.sort((a, b) => parseInt(b.total_rating_count) - parseInt(a.total_rating_count));

        let description = '';

        for (const game of games) {
            const release_dates = game['release_dates'];
            if (release_dates && (game.category == 0 || game.category == 4)) {
                const release_date = await getReleaseDates(release_dates[0]);

                description = description.concat(`- **${game.name}** (*${release_date}*) - ID: ${game.id} \n`);
            }
        }

        if (description == '') description = 'No games found.';

        const embed = new EmbedBuilder()
            .setTitle(`"${gamename}" Search Results`)
            .setDescription(`${description.slice(0, 1998)}`)
            .setColor(0x6441a5);

        await interaction.followUp({ embeds: [embed] });
	},
};

async function getGameJson(body) {
    let res;

    await fetch(
        'https://api.igdb.com/v4/games',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: body,
      })
        .then(response => response.json())
        .then(response => {
            res = response;
        })
        .catch(err => {
            console.error(err);
        });

        return res;
}

async function getReleaseDates(id) {
    let date;

    await fetch(
        'https://api.igdb.com/v4/release_dates',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields category,checksum,created_at,date,game,human,m,platform,region,status,updated_at,y;`,
      })
        .then(response => response.json())
        .then(response => {
            date = response[0].human;
        })
        .catch(err => {
            console.error(err);
        });

    return date;
}