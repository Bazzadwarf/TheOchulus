const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Users = require('./models/users.js')(sequelize, Sequelize.DataTypes);
const Games = require('./models/games.js')(sequelize, Sequelize.DataTypes);
const BeatenGames = require('./models/beatenGames.js')(sequelize, Sequelize.DataTypes);

// Create userId foreignKey
Users.hasMany(BeatenGames);
BeatenGames.belongsTo(Users);

// Create gameId foreignKey
Games.hasMany(BeatenGames);
BeatenGames.belongsTo(Games);

module.exports = { Users, Games, BeatenGames };