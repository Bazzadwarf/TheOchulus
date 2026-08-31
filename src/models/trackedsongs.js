module.exports = (sequelize, DataTypes) => {
    return sequelize.define('trackedsongs', {
        spotifySongId: {
            type: DataTypes.STRING,
        },
        playlistSpotifyId: {
            type: DataTypes.STRING,
        },
        userAddedSpotifyId: {
            type: DataTypes.STRING,
        },
        discordChannelId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });
};