module.exports = (sequelize, DataTypes) => {
    return sequelize.define('games', {
        igdb_id: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            unique: false,
        },
    }, {
        timestamps: false,
    });
};