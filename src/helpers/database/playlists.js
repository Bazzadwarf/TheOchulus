const { TrackedPlaylists, TrackedSongs } = require ('../../dbObjects');

async function getAllTrackedPlaylists() {
    const trackedPlaylists = await TrackedPlaylists.findAll()
    .catch((err) => {
        console.log(err);
    });

    if (trackedPlaylists) return trackedPlaylists;

    return false;
}

async function checkTrackedSpotifyPlaylist(spotifyPlaylistId, discordChannelId) {

    const trackedPlaylist = await TrackedPlaylists.findOne({ where: { spotifyPlaylistId: spotifyPlaylistId, discordChannelId: discordChannelId } })
    .catch((err) => {
        console.log(err);
    });

    if (trackedPlaylist) return trackedPlaylist;

    return false;
}

async function createTrackedPlaylist(spotifyPlaylistId, discordChannelId, currentSongCount) {
    const tp = await TrackedPlaylists.create({ spotifyPlaylistId: spotifyPlaylistId, discordChannelId: discordChannelId, currentSongCount: currentSongCount })
    .catch((err) => {
        console.log(err);
    });

    if (tp) return tp;

    return null;
}

async function deleteTrackedPlaylist(spotifyPlaylistId, discordChannelId) {
    const tp = await TrackedPlaylists.destroy({ where: { spotifyPlaylistId: spotifyPlaylistId, discordChannelId: discordChannelId } })
    .catch((err) => {
        console.log(err);
    });

    await TrackedSongs.destroy({ where: { playlistSpotifyId: spotifyPlaylistId, discordChannelId: discordChannelId } })
    .catch((err) => {
        console.log(err);
    });

    if (tp) return tp;

    return null;
}

async function updateYoutubePlaylistId(spotifyPlaylistId, newYoutubePlaylistId) {
    const tp = await TrackedPlaylists.findOne({ where: { spotifyPlaylistId: spotifyPlaylistId } })
    .catch((err) => {
        console.log(err);
    });
    if (!tp) return null;

    tp.youtubePlaylistId = newYoutubePlaylistId;
    await tp.save();

    return tp;
}

async function updateCurrentSongCount(spotifyPlaylistId, newSongCount) {
    const tp = await TrackedPlaylists.findOne({ where: { spotifyPlaylistId: spotifyPlaylistId } })
    .catch((err) => {
        console.log(err);
    });

    if (!tp) return null;

    tp.currentSongCount = newSongCount;

    await tp.save();

    return tp;
}

module.exports = {
    getAllTrackedPlaylists,
    checkTrackedSpotifyPlaylist,
    createTrackedPlaylist,
    updateYoutubePlaylistId,
    updateCurrentSongCount,
    deleteTrackedPlaylist
}