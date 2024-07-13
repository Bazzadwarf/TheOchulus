const { LoggedGames } = require ('./dbObjects.js');

(async () => {
  try {
    const loggedGames = await LoggedGames.findAll();

    for (const loggedGame of loggedGames) {
      // Define your logic to populate newColumn based on existing data
      loggedGame.statusLastChanged = loggedGame.updatedAt;
      await loggedGame.save();
    }

    console.log('New column populated successfully');
  } catch (error) {
    console.error('Error populating new column:', error);
  }
})();