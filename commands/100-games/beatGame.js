import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('beatgame')
    .setDescription('Log a game that you have beat towards the 100 game challenge!')
    .addStringOption(option => option.setName('gamename').setDescription('The name of the game.'))
    .addNumberOption(option => option.setName('gameid').setDescription('The IGDB game id.').setMinValue(0))
    .addStringOption(option => option.setName('datestarted').setDescription('The date you started playing the game (today if empty).'))
    .addStringOption(option => option.setName('datebeaten').setDescription('The date you beat the game (today if empty).'));

export async function execute(interaction) {
    const gamename = interaction.options.getString('gamename');
    const gameid = interaction.options.getNumber('gameid');

    if (!gamename && !gameid) return interaction.reply('No gamename or gameid supplied, please supply an option to register a game!');

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setAuthor({ name: `${interaction.user.displayName} beat a new game!`, iconURL: interaction.user.avatarURL() })
        .setTitle('osu! beaten')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/en/8/8d/Dark_Souls_Cover_Art.jpg')
        .setDescription(`${interaction.user.displayName} has beaten 69 games, they have 31 games remaining.`)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}