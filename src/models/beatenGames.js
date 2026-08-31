module.exports = (sequelize, DataTypes) => {
    return sequelize.define('beatenGames', {
        status: {
            type: DataTypes.ENUM('planning', 'playing', 'beat'),
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

