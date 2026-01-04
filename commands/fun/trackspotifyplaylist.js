const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTrackedSpotifyPlaylist, createTrackedPlaylist } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails, getAllPlaylistTracks } = require('../../spotifyHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('trackspotifyplaylist')
	.setDescription('Tracks for changes in a spotify playlist and posts updates in the channel this message is sent')
    .addStringOption(option => option.setName('spotifyplaylisturl').setDescription('A link to the spotify playlist to track.').setRequired(true))
    .addBooleanOption(option => option.setName('postalltracks').setDescription('Post all the songs currently in the playlist on first check.').setRequired(false)),
	async execute(interaction) {

        await interaction.deferReply();

        const spotifyPlaylistURL = interaction.options.getString('spotifyplaylisturl');
        const lastIndexOf = spotifyPlaylistURL.lastIndexOf('/');
        const playlistID = spotifyPlaylistURL.substr(lastIndexOf + 1);

        const postAllTracks = interaction.options.getBoolean('postalltracks');

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        const response = await getSpotifyPlaylistDetails(playlistID);

        const result = await checkTrackedSpotifyPlaylist(playlistID, interaction.channelId);

        if (!result) {
            const playlistDetails = await getSpotifyPlaylistDetails(playlistID);
            const tracks = await getAllPlaylistTracks(playlistDetails.id);

            createTrackedPlaylist(playlistID, interaction.channelId, postAllTracks ? tracks.length : 0);

            embed.setColor(0x1db954);
            embed.setTitle(`Now tracking ${response.name}`);
            embed.setURL(response.external_urls.spotify);

            if (response.images) {
                embed.setThumbnail(`${response.images[0].url}`);
            }

            embed.setDescription(`There are currently ${response.tracks.total} tracks in the playlist.`);
        }
        else {
            embed.setColor(0xFFFF00);
            embed.setTitle('Playlist already being tracked');
            embed.setDescription('This playlist is already being tracked in this channel.');
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

