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

Reflect.defineProperty(Users.prototype, 'addUser', {
    value: async function addUser(userData) {
        const user = await Users.findOne({
            where: { user_id: userData.id },
        });

        if (!user) {
            return Users.create({ user_id: userData.discord_id, username: userData.username });
        }
    },
});

Reflect.defineProperty(Users.prototype, 'getUser', {
    value: function getUser(userData) {
        return Users.findAll({
            where: { user_id: userData.discord_id },
        });
    },
});

sequelize.sync({ alter: true })
.catch((err) => {
    console.log(err);
});

module.exports = { sequelize, Users, Games, BeatenGames };