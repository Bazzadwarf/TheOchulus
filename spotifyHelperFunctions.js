async function getSpotifyPlaylistDetails(spotifyPlaylistId) {
    const response = await fetch(
            `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.spotifyAccessToken}`,
                },
            },
        )
        .then(res => res.json());

    return response;
}

async function getAllPlaylistitems(spotifyPlaylistId) {
    let allitems = [];
    let offset = 0;
    const limit = 100;
    let total = 0;

    do {
        await fetch(
            `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/items?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.spotifyAccessToken}`,
                },
            },
        )
        .then(response => response.json())
        .then(response => {
            allitems = allitems.concat(response.items);
            total = response.total;
            offset += limit;
        })
        .catch(err => {
                console.log(err);
        });
    } while (allitems.length < total);

    return allitems;
}

module.exports = {
    getSpotifyPlaylistDetails,
    getAllPlaylistitems,
};