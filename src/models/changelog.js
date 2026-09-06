const { GAME_STATUS } = require('../helpers/gameStatus.js');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('changelog', {
        oldStatus: {
            type: DataTypes.ENUM(GAME_STATUS.PLANNING, GAME_STATUS.PLAYING, GAME_STATUS.BEAT),
            allowNull: true,
        },
        newStatus: {
            type: DataTypes.ENUM(GAME_STATUS.PLANNING, GAME_STATUS.PLAYING, GAME_STATUS.BEAT),
            allowNull: true,
        },
    }, {
        timestamps: true,
    });
};

