const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkTrackedSpotifyPlaylist, createTrackedPlaylist } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails, getAllPlaylistitems } = require('../../spotifyHelperFunctions.js');
const { TrackedSongs } = require ('../../dbObjects.js');

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
        let playlistID = spotifyPlaylistURL.substr(lastIndexOf + 1);

        const postAllTracks = interaction.options.getBoolean('postalltracks');

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        const response = await getSpotifyPlaylistDetails(playlistID);

        const result = await checkTrackedSpotifyPlaylist(playlistID, interaction.channelId);

        if (!result) {
            const playlistDetails = await getSpotifyPlaylistDetails(playlistID);
            const items = await getAllPlaylistitems(playlistDetails.id);

            playlistID = playlistDetails.id;

            const trackedPlaylist = await createTrackedPlaylist(playlistID, interaction.channelId, postAllTracks ? 0 : items.length);

            embed.setColor(0x1db954);
            embed.setTitle(`Now tracking ${response.name}`);
            embed.setURL(response.external_urls.spotify);

            if (response.images) {
                embed.setThumbnail(`${response.images[0].url}`);
            }

            embed.setDescription(`There are currently ${response.items.total} tracks in the playlist.`);

            const channel = await interaction.client.channels.cache.get(`${trackedPlaylist.discordChannelId}`);

            for (const track of items) {
                if (!track.track) {
                    continue;
                }

                const trackedSong = await TrackedSongs.findOne({
                    where: {
                        spotifySongId: track.track.id,
                        playlistSpotifyId: playlistDetails.id,
                        userAddedSpotifyId: track.added_by ? track.added_by.id : null,
                        discordChannelId: interaction.channelId,
                    },
                });

                if (trackedSong) {
                    continue;
                }

                await TrackedSongs.create({
                    spotifySongId: track.track.id,
                    playlistSpotifyId: playlistDetails.id,
                    userAddedSpotifyId: track.added_by ? track.added_by.id : null,
                    discordChannelId: interaction.channelId,
                });

                if (postAllTracks) {
                // Post all tracks

                    const trackembed = new EmbedBuilder()
                    .setColor(0x1db954)
                    .setTitle(`${track.track.name} added!`)
                    .setURL(track.track.external_urls.spotify)
                    .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
                    .setTimestamp();

                    if (track.added_by) {
                        await fetch(
                            `https://api.spotify.com/v1/users/${track.added_by.id}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${process.env.spotifyAccessToken}`,
                                },
                            },
                        )
                        .then(response => response.json())
                        .then(response => {
                            if (response.images.length > 0) {
                                trackembed.setAuthor({ name: `${response.display_name} added a new song to ${playlistDetails.name}!`, iconURL: response.images[0].url });
                            }
                            else {
                                trackembed.setAuthor({ name: `${response.display_name} added a new song to ${playlistDetails.name}!` });
                            }
                        })
                        .catch(err => {
                                console.log(err);
                        });
                    }

                    trackembed.addFields({ name: 'Title', value: `[${track.track.name}](${track.track.external_urls.spotify})`, inline: true });

                    const artists = track.track.artists.map(artist => `[${artist.name}](${artist.external_urls.spotify})`).join(', ');
                    trackembed.addFields({ name: 'Artists', value: artists, inline: true });

                    trackembed.addFields({ name: 'Album', value: `[${track.track.album.name}](${track.track.album.external_urls.spotify})`, inline: true });

                    if (track.track.album.images.length > 0)
                    {
                        trackembed.setThumbnail(track.track.album.images[0].url);
                    }

                    trackembed.setDescription(`[Go to the playlist on spotify!](${playlistDetails.external_urls.spotify})`);

                    await channel.send({ embeds: [trackembed] });
                }
            }
        }
        else {
            embed.setColor(0xFFFF00);
            embed.setTitle('Playlist already being tracked');
            embed.setDescription('This playlist is already being tracked in this channel.');
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

