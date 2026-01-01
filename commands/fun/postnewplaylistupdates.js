const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { getAllTrackedPlaylists, updateCurrentSongCount } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails, getAllPlaylistTracks } = require('../../spotifyHelperFunctions.js');

async function PostNewPlaylistUpdates(client) {
    if (!process.env.spotifyAccessToken) {
        return;
    }

    const playlists = await getAllTrackedPlaylists();

    for (const playlist of playlists) {
        const playlistDetails = await getSpotifyPlaylistDetails(playlist.spotifyPlaylistId);

        const tracks = await getAllPlaylistTracks(playlistDetails.id);

        if (tracks.length == playlist.currentSongCount) {
            continue;
        }

        const channel = await client.channels.cache.get(`${playlist.discordChannelId}`);

        for (let i = (playlist.currentSongCount) ? playlist.currentSongCount : 0; i < tracks.length; i++) {
            const track = tracks[i];

            const embed = new EmbedBuilder()

            .setColor(0x1db954)
            .setTitle(`${track.track.name} added!`)
            .setURL(track.track.external_urls.spotify)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: client.user.avatarURL() })
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
                        embed.setAuthor({ name: `${response.display_name} added a new song to ${playlistDetails.name}!`, iconURL: response.images[0].url });
                    }
                    else {
                        embed.setAuthor({ name: `${response.display_name} added a new song to ${playlistDetails.name}!` });
                    }
                })
                .catch(err => {
                        console.log(err);
                });
            }

            embed.addFields({ name: 'Title', value: `[${track.track.name}](${track.track.external_urls.spotify})`, inline: true });

            const artists = track.track.artists.map(artist => `[${artist.name}](${artist.external_urls.spotify})`).join(', ');
            embed.addFields({ name: 'Artists', value: artists, inline: true });

            embed.addFields({ name: 'Album', value: `[${track.track.album.name}](${track.track.album.external_urls.spotify})`, inline: true });

            if (track.track.album.images.length > 0)
            {
                embed.setThumbnail(track.track.album.images[0].url);
            }

            await channel.send({ embeds: [embed] });
        }

        await updateCurrentSongCount(playlist.spotifyPlaylistId, tracks.length);
    }
}

module.exports = {
    PostNewPlaylistUpdates,
};