const { Users, LoggedGames } = require ('../../dbObjects');
const { Op } = require('sequelize');

async function getLeaderboardEntries() {
    const users = await Users.findAll()
    .catch((err) => {
        console.log(err);
    });

    const results = [];

    for (let i = 0; i < users.length; i++) {
        const games = await LoggedGames.findAll({ where: { userId: users[i].id, status: 'beat' } });
        const count = games.length;
        let dateLastBeat = new Date();

        if (count > 0) {
            games.sort((a, b) => new Date(a.statusLastChanged) - new Date(b.statusLastChanged));
            const lastGame = games[games.length - 1];
            dateLastBeat = lastGame.statusLastChanged;
        }

        const res = await Users.findOne({ where: { id: users[i].id } })
        .catch((err) => {
            console.log(err);
        });
        const username = res.username;

        const result = { username, count, dateLastBeat };
        results.push(result);
    }

    results.sort((a, b) => new Date(a.dateLastBeat) - new Date(b.dateLastBeat));
    results.sort((a, b) => parseInt(b.count) - parseInt(a.count));

    return results;
}

async function getLeaderboardEntriesBetweenDates(start, end) {
    const users = await Users.findAll()
    .catch((err) => {
        console.log(err);
    });

    const results = [];

    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let i = 0; i < users.length; i++) {
        const games = await LoggedGames.findAll({ where: { userId: users[i].id, status: 'beat', statusLastChanged: { [ Op.between ]: [startDate, endDate] } } });
        const count = games.length;
        let dateLastBeat = new Date();

        if (count > 0) {
            games.sort((a, b) => new Date(a.statusLastChanged) - new Date(b.statusLastChanged));
            const lastGame = games[games.length - 1];
            dateLastBeat = lastGame.statusLastChanged;
        }

        const res = await Users.findOne({ where: { id: users[i].id } })
        .catch((err) => {
            console.log(err);
        });
        const username = res.username;

        const result = { username, count, dateLastBeat };
        results.push(result);
    }

    results.sort((a, b) => new Date(a.dateLastBeat) - new Date(b.dateLastBeat));
    results.sort((a, b) => parseInt(b.count) - parseInt(a.count));

    return results;
}

module.exports = {
    getLeaderboardEntries,
    getLeaderboardEntriesBetweenDates
};