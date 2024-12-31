const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, getBeatenGames, checkGameStorageId, getChangelog, getLeaderboardEntriesBetweenDates, getLeaderboardEntries, getBeatenGamesForYear } = require('../../databaseHelperFunctions');
const { getGameJson, getGenres, getCompanyInfo } = require('../../igdbHelperFunctions');

let userBeatenGamesDatabaseEntries = {};
let beatGameIGDBEntries = [];
let companies = [];

module.exports = {
	data: new SlashCommandBuilder()
	.setName('wrapped')
	.setDescription('Get your yearly summary.')
	.addUserOption(option => option.setName('user').setDescription('The user to check'))
	.addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 })),
	async execute(interaction) {

		await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');
		let year = new Date().getFullYear();
		const yearOption = interaction.options.getInteger('year');

        if (userOption) {
            user = userOption;
        }

		if (yearOption) {
			year = yearOption;
		}

		const userDatabaseEntry = await getUserRegistration(user);
		if (!userDatabaseEntry) return interaction.followUp({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

		await GetBeatenGamesForYear(userDatabaseEntry, year);

		if (!userBeatenGamesDatabaseEntries || userBeatenGamesDatabaseEntries.length === 0) {
			return interaction.followUp({ content: `${user.username} hasn't beaten any games in this time frame.`, ephemeral: false });
		}

		await GetIGDBEntries(userBeatenGamesDatabaseEntries);
		await GetDevelopers();

		const numberOfGamesBeat = await GetNumberOfGamesBeat();
		const averageBeatGameInterval = await GetAverageBeatInterval(year);
		const mostActiveMonth = await GetMostActiveMonth(userDatabaseEntry, year);
		const oldestGameBeat = await GetOldestGameBeat();
		const newestGameBeat = await GetNewestGameBeat();
		const averageGameAge = await GetAverageGameAge();
		const favouriteGameGenres = await GetFavouriteGenres();
		const favouriteGameDevs = await GetFavouriteDevelopers();
		const favouriteGamePublishers = await GetFavouritePublishers();
		const numberOfGamesDropped = await GetNumberOfDroppedGames(userDatabaseEntry);
		const yearLeaderboardPlace = await GetYearLeaderboardPosition(userDatabaseEntry, year);
		const currentLeaderboardPlace = await GetLeaderboardPosition(userDatabaseEntry);

		const embed = new EmbedBuilder();
        embed.setColor(0x3BA55C);
        embed.setTitle(`The 100 Games Challenge: ${year} Wrapped`);
		embed.setDescription(`Here are the stats for the games you played for the 100 Games Challenge in ${year} ${user.displayName}`);
        embed.setThumbnail(user.avatarURL());
		embed.setTimestamp();
		embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });

		embed.addFields({ name: 'Number of Games Beat', value: numberOfGamesBeat.toString(), inline: true });
		embed.addFields({ name: 'Average Beat Interval', value: `${Math.round(averageBeatGameInterval).toString()} days`, inline: true });
		embed.addFields({ name: 'Most Active Month', value: mostActiveMonth, inline: true });
		embed.addFields({ name: 'Number Of Games Dropped', value: numberOfGamesDropped, inline: true });
		embed.addFields({ name: 'Yearly Leaderboard', value: yearLeaderboardPlace, inline: true });
		embed.addFields({ name: 'Overall Leaderboard', value: currentLeaderboardPlace, inline: true });
		embed.addFields({ name: 'Oldest Beat Game', value: oldestGameBeat });
		embed.addFields({ name: 'Newest Beat Game', value: newestGameBeat });
		embed.addFields({ name: 'Average Game Age', value: averageGameAge });
		embed.addFields({ name: 'Favourite Game Genres', value: favouriteGameGenres });
		embed.addFields({ name: 'Favourite Game Developers', value: favouriteGameDevs });
		embed.addFields({ name: 'Favourite Game Publisher', value: favouriteGamePublishers });

		return interaction.followUp({ embeds: [embed] });
	},
};

function FilterByMonth(array, targetMonth) {
	return array.filter(entry => {
		const date = new Date(entry.updatedAt);
		return date.getMonth() === targetMonth;
	});
}

function FilterByYear(array, targetYear) {
	return array.filter(entry => {
		const date = new Date(entry.updatedAt);
		return date.getFullYear() === targetYear;
	});
}

async function GetBeatenGamesForYear(userDatabaseEntry, year) {
	userBeatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);

	if (userBeatenGamesDatabaseEntries && userBeatenGamesDatabaseEntries.length > 0) {
		userBeatenGamesDatabaseEntries = FilterByYear(userBeatenGamesDatabaseEntries, year);
	}
}

async function GetIGDBEntries(array) {
	beatGameIGDBEntries = [];

	for (let i = 0; i < array.length; i++) {
		const game = await checkGameStorageId(array[i].gameId);
		const json = await getGameJson(String.prototype.concat('where id = ', game.igdb_id, '; fields *;'));
		beatGameIGDBEntries.push(json[0]);
	}
}

async function GetDevelopers() {
	companies = [];
	const companyIds = new Set();

	for (let i = 0; i < beatGameIGDBEntries.length; i++) {
		for (let j = 0; j < beatGameIGDBEntries[i].involved_companies.length; j++) {
			companyIds.add(beatGameIGDBEntries[i].involved_companies[j]);
		}
	}

	const ids = [...companyIds];
	const tempIds = [];

	for (let i = 0; i < ids.length; i++) {
		const company = await getCompanyInfo(ids[i]);

		if (!tempIds.includes(company.id)) {
			tempIds.push(company.id);
			companies.push(company);
		}
	}
}

async function GetNumberOfGamesBeat() {
	if (userBeatenGamesDatabaseEntries) {
		return userBeatenGamesDatabaseEntries.length;
	}

	return 0;
}

async function GetAverageBeatInterval(year) {
	if (userBeatenGamesDatabaseEntries && userBeatenGamesDatabaseEntries.length > 0) {
		const today = new Date(year, 0, 1);
		const start = new Date(year, 0, 1);
		const days = (today - start) / (1000 * 60 * 60 * 24);
		const timepergame = days / userBeatenGamesDatabaseEntries.length;
		return Math.round(timepergame);
	}

	return 0;
}

async function GetMostActiveMonth(userDatabaseEntry, year) {
	if (userBeatenGamesDatabaseEntries && userBeatenGamesDatabaseEntries.length > 0) {

		const results = [];
		results.push(['January', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-01-01`, `${year}-02-01`)]);
		results.push(['February', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-02-01`, `${year}-03-01`)]);
		results.push(['March', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-03-01`, `${year}-04-01`)]);
		results.push(['April', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-04-01`, `${year}-05-01`)]);
		results.push(['May', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-05-01`, `${year}-06-01`)]);
		results.push(['June', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-06-01`, `${year}-07-01`)]);
		results.push(['July', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-07-01`, `${year}-08-01`)]);
		results.push(['August', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-08-01`, `${year}-09-01`)]);
		results.push(['September', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-09-01`, `${year}-10-01`)]);
		results.push(['October', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-10-01`, `${year}-11-01`)]);
		results.push(['November', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-11-01`, `${year}-12-01`)]);
		results.push(['December', await getBeatenGamesForYear(userDatabaseEntry.id, `${year}-12-01`, `${year + 1}-01-01`)]);

		const sorted = Object.entries(results).sort((a, b) => b[1][1] - a[1][1]);

		return sorted[0][1][0] + ' (' + sorted[0][1][1].toString() + ' games)';
	}

	return '';
}

async function GetOldestGameBeat() {
	if (beatGameIGDBEntries.length > 0) {
		let oldestGame = beatGameIGDBEntries[0];

		for (let i = 1; i < beatGameIGDBEntries.length; i++) {
			if (beatGameIGDBEntries[i].first_release_date < oldestGame.first_release_date) {
				oldestGame = beatGameIGDBEntries[i];
			}
		}

		const gameName = oldestGame.name;
		const gameReleaseDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(oldestGame.first_release_date * 1000);
		return gameName + ' *(' + gameReleaseDate + ')*';
	}
	return '';
}

async function GetNewestGameBeat() {
	if (beatGameIGDBEntries.length > 0) {
		let newestGame = beatGameIGDBEntries[0];

		for (let i = 1; i < beatGameIGDBEntries.length; i++) {
			if (beatGameIGDBEntries[i].first_release_date > newestGame.first_release_date) {
				newestGame = beatGameIGDBEntries[i];
			}
		}

		const gameName = newestGame.name;
		const gameReleaseDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(newestGame.first_release_date * 1000);
		return gameName + ' *(' + gameReleaseDate + ')*';
	}
	return '';
}

async function GetAverageGameAge() {
	if (beatGameIGDBEntries.length > 0) {
		let averageGameAge = 0;

		for (let i = 0; i < beatGameIGDBEntries.length; i++) {
			averageGameAge += beatGameIGDBEntries[i].first_release_date;
		}

		averageGameAge /= beatGameIGDBEntries.length;
		averageGameAge = new Date(averageGameAge * 1000);
		const today = new Date();
		let year = today.getFullYear() - averageGameAge.getFullYear();
		let month = today.getMonth() - averageGameAge.getMonth();
		let day = today.getDate() - averageGameAge.getDate();

		while (month < 0 || day < 0) {
			if (month < 0) {
				year--;
				month += 12;
			}

			if (day < 0) {
				month--;
				const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
				day += previousMonth.getDate();
			}
		}

		return `${year} years, ${month} months, ${day} days old`;
	}
	return ' ';
}

async function GetFavouriteGenres() {
	const genres = [];
	const counts = [];
	for (let i = 0; i < beatGameIGDBEntries.length; i++) {
		for (let j = 0; j < beatGameIGDBEntries[i].genres.length; j++) {
			const genre = await getGenres(beatGameIGDBEntries[i].genres[j]);
			genres.push(genre);
		}
	}

	genres.forEach(item => {
		counts[item] = (counts[item] || 0) + 1;
	});

	const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

	const keys = Object.keys(sortedCounts);

	let string = ' ';
	for (let i = 0; i < keys.length && i < 5; i++) {
		const genre = keys[i];

		if (sortedCounts[genre][1] > 1) {
			string = string.concat(` ${sortedCounts[genre][0]} (${sortedCounts[genre][1]} games),`);
		}
	}

	if (string.length > 1) {
		string = string.slice(1, -1);
	}

	return string;
}

async function GetFavouriteDevelopers() {
	const developers = [];
	const counts = [];

	for (let i = 0; i < companies.length; i++) {
		if (companies[i].developed) {
			const developedGames = companies[i].developed;
			for (let j = 0; j < beatGameIGDBEntries.length; j++) {
				const found = developedGames.find(item => item === beatGameIGDBEntries[j].id);
				if (found) {
					developers.push(companies[i].name);
				}
			}
		}
	}

	developers.forEach(item => {
		counts[item] = (counts[item] || 0) + 1;
	});

	const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

	const keys = Object.keys(sortedCounts);

	let string = ' ';
	for (let i = 0; i < keys.length && i < 5; i++) {
		const developer = keys[i];

		if (sortedCounts[developer][1] > 1) {
			string = string.concat(` ${sortedCounts[developer][0]} (${sortedCounts[developer][1] } games),`);
		}
	}

	if (string.length > 1) {
		string = string.slice(1, -1);
	}

	return string;
}

async function GetFavouritePublishers() {
	const publishers = [];
	const counts = [];

	for (let i = 0; i < companies.length; i++) {
		if (companies[i].published) {
			const developedGames = companies[i].published;
			for (let j = 0; j < beatGameIGDBEntries.length; j++) {
				const found = developedGames.includes(beatGameIGDBEntries[j].id);

				if (found) {
					publishers.push(companies[i].name);
				}
			}
		}
	}

	publishers.forEach(item => {
		counts[item] = (counts[item] || 0) + 1;
	});

	const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

	const keys = Object.keys(sortedCounts);

	let string = ' ';
	for (let i = 0; i < keys.length && i < 5; i++) {
		const publisher = keys[i];

		if (sortedCounts[publisher][1] > 1) {
			string = string.concat(` ${sortedCounts[publisher][0]} (${sortedCounts[publisher][1]} games),`);
		}
	}

	if (string.length > 1) {
		string = string.slice(1, -1);
	}

	return string;
}

async function GetNumberOfDroppedGames(userDatabaseEntry) {
	const userChangelog = await getChangelog(userDatabaseEntry.id);
	const droppedGames = userChangelog.filter(item => item.oldStatus === 'playing' && item.newStatus === null);

	if (droppedGames) {
		return droppedGames.length.toString();
	}

	return '0';
}

async function GetYearLeaderboardPosition(userDatabaseEntry, year) {
	const leaderboard = await getLeaderboardEntriesBetweenDates(`${year}-01-01`, `${year}-12-31`);
	const index = leaderboard.findIndex(item => item.username === userDatabaseEntry.username) + 1;
	return await appendOrdinalSuffix(index);
}

async function GetLeaderboardPosition(userDatabaseEntry) {
	const leaderboard = await getLeaderboardEntries();
	const index = leaderboard.findIndex(item => item.username === userDatabaseEntry.username) + 1;
	return await appendOrdinalSuffix(index);
}

async function appendOrdinalSuffix(number) {
	const lastDigit = number % 10;
	const lastTwoDigits = number % 100;

	// Handle special case for 11th, 12th, 13th, etc.
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return number + 'th';
	}

	// Handle the common cases for 1st, 2nd, 3rd
	switch (lastDigit) {
		case 1:
			return number + 'st';
		case 2:
			return number + 'nd';
		case 3:
			return number + 'rd';
		default:
			return number + 'th';
	}
}