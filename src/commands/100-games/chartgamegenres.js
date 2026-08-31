const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson, getGenres } = require('../../igdbHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartgamegenres')
	.setDescription('Generate a bar chart of the different genres of the games you have beat')
    .addUserOption(option => option.setName('user').setDescription('The user to check'))
    .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 }))
    .addBooleanOption(option => option.setName('ignoreadventure').setDescription('Exclude the Adventure genre from the bar chart')),
	async execute(interaction) {

        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');
        const yearOption = interaction.options.getInteger('year');
        const ignoreadventure = interaction.options.getBoolean('ignoreadventure');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

        let beatenGamesDatabaseEntries;

        if (yearOption) {
            beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);

            if (beatenGamesDatabaseEntries && beatenGamesDatabaseEntries.length > 0) {
                beatenGamesDatabaseEntries = await beatenGamesDatabaseEntries.filter(entry => {
                    const date = new Date(entry.updatedAt);
                    return date.getFullYear() === yearOption;
                });
            }
        }
        else {
            beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);
        }

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
        const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s beat games age`)
        .setDescription(`${user.username} has not beat any games`)
        .setColor(0xFF0000);
        return interaction.editReply({ embeds: [embed] });
        }

        const gameIds = [];

        for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
          const game = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
          gameIds.push(game.igdb_id);
        }

        const beatGameIGDBEntries = await getGameJson(String.prototype.concat(`where id = (${gameIds}); fields *; limit ${gameIds.length};`));

        const counts = [];
        const cachedGenres = new Set();

        for (let i = 0; i < beatGameIGDBEntries.length; i++) {
            if (beatGameIGDBEntries[i].genres) {
                for (let j = 0; j < beatGameIGDBEntries[i].genres.length; j++) {
                    cachedGenres.add(beatGameIGDBEntries[i].genres[j]);
                }
            }
        }

        const genresinfo = await getGenres([...cachedGenres]);

        const genres = [];

        for (let i = 0; i < beatGameIGDBEntries.length; i++) {
            if (beatGameIGDBEntries[i].genres) {
                for (let j = 0; j < beatGameIGDBEntries[i].genres.length; j++) {
                    genres.push(genresinfo.find(item => item.id === beatGameIGDBEntries[i].genres[j]).name);
                }
            }
        }

        genres.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });

        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        const keys = Object.keys(sortedCounts);

        const labels = [];
        const values = [];

        for (let i = 0; i < keys.length; i++) {
            const genre = keys[i];

            if (ignoreadventure && sortedCounts[genre][0] == 'Adventure')
            {
                continue;
            }

            labels.push(sortedCounts[genre][0]);
            values.push(sortedCounts[genre][1]);
        }

        // Create a canvas
        const canvas = createCanvas(1920, 1080);

        // Chart data
        const data = {
        labels: labels,
        datasets: [
            {
            label: 'Game Genres',
            data: values,
            borderColor: '#5865F2',
            backgroundColor: 'rgba(88, 101, 242, 0.5)',
            borderWidth: 8,
            },
        ],
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Genres',
                            font: {
                            size: 48,
                            family: 'Tahoma',
                            },
                            color: 'white',
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineWidth: 0,
                        },
                        ticks: {
                            color: 'white',
                            font: {
                                size: 24,
                                family: 'Tahoma',
                            },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Occurrences of genre',
                            font: {
                            size: 48,
                            family: 'Tahoma',
                            },
                            color: 'white',
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineWidth: 2,
                        },
                        ticks: {
                            stepSize: 1,
                            },
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${user.username}'s most common game genres`,
                        font: {
                            size: 64,
                            family: 'Tahoma',
                        },
                        color: 'white',
                    },
                },
            },
        };

        // Create the chart
        const chart = new Chart(canvas, config);

        // Save the chart as an image
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('./tempbeattimeline.png', buffer);

        // Use the image in your embed
        return interaction.editReply({
        files: ['./tempbeattimeline.png'],
        });
    },
};