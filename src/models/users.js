module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        discord_id: {
            type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};