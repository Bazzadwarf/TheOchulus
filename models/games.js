module.exports = (sequelize, DataTypes) => {
    return sequelize.define('games', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: false,
        },
    }, {
        timestamps: false,
    });
};