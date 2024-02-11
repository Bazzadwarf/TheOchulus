const { Sequelize, DataTypes } = require('sequelize');
require('./dbObjects.js');
const { sequelize, LoggedGames } = require ('./dbObjects.js');

// Add a new column to the existing table
(async () => {
  try {
    await sequelize.sync();

    await sequelize.getQueryInterface().addColumn(
        'BeatenGames',
        'status',
        {
            type: DataTypes.ENUM('planning', 'playing', 'beat'),
            allowNull: false,
            defaultValue: 'beat',
        },
    );

    console.log('New column added successfully');
  } catch (error) {
    console.error('Error adding new column:', error);
  } finally {
    sequelize.sync();
  }
})();