const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTrackedSpotifyPlaylist, createTrackedPlaylist, updateYoutubePlaylistId } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails, getAllPlaylistTracks } = require('../../spotifyHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('trackspotifyplaylist')
	.setDescription('Tracks for changes in a spotify playlist and posts updates in the channel this message is sent')
    .addStringOption(option => option.setName('spotifyplaylisturl').setDescription('A link to the spotify playlist to track.').setRequired(true))
    .addStringOption(option => option.setName('youtubeplaylisturl').setDescription('A link to the youtube playlist to sync to.')),
	async execute(interaction) {

        await interaction.deferReply();

        const spotifyPlaylistURL = interaction.options.getString('spotifyplaylisturl');
        const lastIndexOf = spotifyPlaylistURL.lastIndexOf('/');
        const playlistID = spotifyPlaylistURL.substr(lastIndexOf + 1);

        const youtubePlaylistURL = interaction.options.getString('youtubeplaylisturl');
        let youtubePlaylistID = null;
        if (youtubePlaylistURL) {
            const youtubeLastIndexOf = youtubePlaylistURL.lastIndexOf('=');
            youtubePlaylistID = youtubePlaylistURL.substr(youtubeLastIndexOf + 1);
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        const response = await getSpotifyPlaylistDetails(playlistID);

        const result = await checkTrackedSpotifyPlaylist(playlistID, interaction.channelId);

        if (!result) {
            const playlistDetails = await getSpotifyPlaylistDetails(playlistID);
            const tracks = await getAllPlaylistTracks(playlistDetails.id);

            createTrackedPlaylist(playlistID, youtubePlaylistID, interaction.channelId, tracks.length);

            embed.setColor(0x1db954);
            embed.setTitle(`Now tracking ${response.name}`);
            embed.setURL(response.external_urls.spotify);

            if (response.images) {
                embed.setThumbnail(`${response.images[0].url}`);
            }

            embed.setDescription(`There are currently ${response.tracks.total} tracks in the playlist.`);
        }
        else if (result.youtubePlaylistId !== youtubePlaylistID) {
            updateYoutubePlaylistId(playlistID, youtubePlaylistID);
            embed.setColor(0x1db954);
            embed.setTitle(`Updated YouTube playlist for ${response.name}`);
            embed.setURL(response.external_urls.spotify);
            embed.setDescription('The YouTube playlist linked to this Spotify playlist has been updated.');
        }
        else {
            embed.setColor(0xFFFF00);
            embed.setTitle('Playlist already being tracked');
            embed.setDescription('This playlist is already being tracked in this channel.');
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

