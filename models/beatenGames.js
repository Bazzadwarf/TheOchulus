module.exports = (sequelize, DataTypes) => {
    return sequelize.define('beatenGames', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        game_id: DataTypes.STRING,
        date_created: DataTypes.DATE,
        date_last_modified: DataTypes.DATE,
    }, {
        timestamps: false,
    });
};

