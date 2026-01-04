module.exports = (sequelize, DataTypes) => {
    return sequelize.define('trackedplaylists', {
        spotifyPlaylistId: {
            type: DataTypes.STRING,
            unique: true,
        },
        playlistLastUpdated: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        discordChannelId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currentSongCount: {
            type: DataTypes.INTEGER,
        },
    }, {
        timestamps: true,
    });
};

