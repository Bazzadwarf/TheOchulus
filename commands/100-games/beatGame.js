import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('beatgame')
    .setDescription('Log a game that you have beat towards the 100 game challenge!')
    .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
    .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0))
    .addStringOption(option => option.setName('datestarted').setDescription('The date you started playing the game (today if empty).'))
    .addStringOption(option => option.setName('datebeaten').setDescription('The date you beat the game (today if empty).'))
    .addStringOption(option => option.setName('platform').setDescription('The platform the game was released on.'));
export async function execute(interaction) {
    const gamename = interaction.options.getString('gamename');
    const gameid = interaction.options.getNumber('gameid');
    const platform = interaction.options.getString('platform');

    if (!gamename && !gameid) return interaction.reply('No gamename or gameid supplied, please supply an option to register a game!');

    let body = "";

    if (gameid) {
        body = body.concat('where id = ', gameid,'; ');
    } else if (gamename) {
        body = body.concat('search "', gamename,'"; ');
    }

    body = body.concat('fields *;');

    let res = await getGameJson(body);

    const coverUrl = await getCoverURL(res[0].cover);

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setAuthor({ name: `${interaction.user.displayName} beat a new game!`, iconURL: interaction.user.avatarURL() })
        .setTitle(`${res[0].name} beaten!`)
        .setThumbnail(`${coverUrl}`)
        .setDescription(`${interaction.user.displayName} has beaten 69 games, they have 31 games remaining.`)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}

async function getGameJson(body) {
    let res;
    
    await fetch(
        "https://api.igdb.com/v4/games",
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: body
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

async function getPlatformID(platform) {
   
    await fetch(
        "https://api.igdb.com/v4/platforms",
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where name = "${platform}", alternative_name = "${platform}"; fields id;`
      })
      .then(response => response.json())
      .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
}

async function getCoverURL(id) {
    let url = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png";

    await fetch(
        "https://api.igdb.com/v4/covers",
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields url;`
        })
        .then(response => response.json())
        .then(response => {
            if (response[0]) {
                url = 'https:'.concat(response[0].url);
            }
        })
        .catch(err => {
            console.error(err);
        });

        return url;
}