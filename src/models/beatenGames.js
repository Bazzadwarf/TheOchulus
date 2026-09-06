const { GAME_STATUS } = require('../helpers/gameStatus.js');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('beatenGames', {
        status: {
            type: DataTypes.ENUM(GAME_STATUS.PLANNING, GAME_STATUS.PLAYING, GAME_STATUS.BEAT),
            allowNull: true,
        },
        statusLastChanged: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });
};

