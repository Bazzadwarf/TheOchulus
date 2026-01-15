const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllTrackedPlaylists } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails } = require('../../spotifyHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('listpotifyplaylists')
	.setDescription('List all tracked spotifty playlists in this channel'),
	async execute(interaction) {

        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

            const playlists = await getAllTrackedPlaylists();

            const channelPlaylists = playlists.filter(playlist => playlist.discordChannelId === interaction.channelId);

            for (const playlist of channelPlaylists) {
                const details = await getSpotifyPlaylistDetails(playlist.spotifyPlaylistId);
                embed.addFields({ name: details.name, value: `Songs Tracked: ${playlist.currentSongCount}\n[Spotify Link](${details.external_urls.spotify})`, inline: false });
            }

            embed.setColor(0x1db954);
            embed.setTitle(`Currently tracking ${channelPlaylists.length} playlists`);

        await interaction.editReply({ embeds: [embed] });
    },
};

