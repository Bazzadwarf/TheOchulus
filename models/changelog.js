module.exports = (sequelize, DataTypes) => {
    return sequelize.define('changelog', {
        oldStatus: {
            type: DataTypes.ENUM('planning', 'playing', 'beat'),
            allowNull: true,
        },
        newStatus: {
            type: DataTypes.ENUM('planning', 'playing', 'beat'),
            allowNull: true,
        },
    }, {
        timestamps: true,
    });
};

