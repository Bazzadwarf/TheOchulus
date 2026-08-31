const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson, getInvolvedCompanies, getCompanies } = require('../../igdbHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartgamepublishers')
	.setDescription('Generate a bar chart of the different publishers of the games you have beat')
    .addUserOption(option => option.setName('user').setDescription('The user to check'))
    .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 })),
	async execute(interaction) {

        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');
        const yearOption = interaction.options.getInteger('year');

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

        const involvedCompanyIds = new Set();

        for (let i = 0; i < beatGameIGDBEntries.length; i++) {
            if (beatGameIGDBEntries[i].involved_companies)
            {
                for (let j = 0; j < beatGameIGDBEntries[i].involved_companies.length; j++) {
                    involvedCompanyIds.add(beatGameIGDBEntries[i].involved_companies[j]);
                }
            }
        }

        const involvedIds = [...involvedCompanyIds];

        const involvedCompanies = await getInvolvedCompanies(involvedIds);
        const companyIds = new Set();
        for (let i = 0; i < involvedCompanies.length; i++) {
            if (involvedCompanies[i].company)
            {
                companyIds.add(involvedCompanies[i].company);
            }
        }

        const compIds = [...companyIds];
        const companies = await getCompanies(compIds);

        const publishers = [];
        const counts = [];

        for (let i = 0; i < companies.length; i++) {
            if (companies[i].published) {
                const publishedGames = companies[i].published;
                for (let j = 0; j < beatGameIGDBEntries.length; j++) {
                    const found = publishedGames.find(item => item === beatGameIGDBEntries[j].id);
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

        const labels = [];
        const values = [];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (sortedCounts[key][1] > 1) {
                labels.push(sortedCounts[key][0]);
                values.push(sortedCounts[key][1]);
            }
        }

        // Create a canvas
        const canvas = createCanvas(1920, 1080);

        // Chart data
        const data = {
        labels: labels,
        datasets: [
            {
            label: 'Game Publishers',
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
                            text: 'Occurrences of publishers',
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
                        text: `${user.username}'s most common game publishers`,
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