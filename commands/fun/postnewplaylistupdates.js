const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');

async function getAllPlaylistTracks() {
    let allTracks = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    do {
        await fetch(
            `https://api.spotify.com/v1/playlists/${process.env.spotifyPlaylistTracking}/tracks?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.spotifyAccessToken}`,
                },
            },
        )
        .then(response => response.json())
        .then(response => {
            allTracks = allTracks.concat(response.items);
            total = response.total;
            offset += limit;
        })
        .catch(err => {
                console.log(err);
        });
    } while (allTracks.length < total);

    return allTracks;
}


let seenTrackIds = new Set();

async function PostNewPlaylistUpdates(client) {
    if (!process.env.spotifyPlaylistTracking || !process.env.spotifyPlaylistChannel || !process.env.spotifyAccessToken) {
        return;
    }

    if (fs.existsSync('./playlistContent.json')) {
        seenTrackIds = new Set(JSON.parse(fs.readFileSync('./playlistContent.json', 'utf-8')));
    }
    else {
        seenTrackIds = new Set();
    }


    const tracks = await getAllPlaylistTracks();
    if (tracks.length <= 1) return;

    const currentIds = tracks.map(item => item.track.id);

    let newTracks;

    if (seenTrackIds.size > 0)
    {
        newTracks = currentIds.filter(id => !seenTrackIds.has(id));
    } else {
        newTracks = currentIds;
    }

    const channel = await client.channels.cache.get(process.env.spotifyPlaylistChannel);

    for (const trackID of newTracks) {
        // Send discord embeds;
        const track = tracks.find(item => item.track.id === trackID);

        console.log(track);

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
                    embed.setAuthor({ name: `${response.display_name} added a new song!`, iconURL: response.images[0].url });
                }
                else {
                    embed.setAuthor({ name: `${response.display_name} added a new song!` });
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

    seenTrackIds = new Set(currentIds);

    fs.writeFileSync('./playlistContent.json', JSON.stringify([...seenTrackIds]));
}

module.exports = {
    getAllPlaylistTracks,
    PostNewPlaylistUpdates,
};