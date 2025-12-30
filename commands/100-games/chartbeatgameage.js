const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson } = require('../../igdbHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartbeatgameage')
	.setDescription('Generate a scatter chart of the age of the games that have been beaten')
    .addUserOption(option => option.setName('user').setDescription('The user to check'))
    .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 }))
    .addIntegerOption(option => option.setName('sorting').setDescription('How should the data be sorted?').addChoices({ name: 'Oldest to newest', value: 1 }, { name: 'Newest to oldest', value: 2 })),
	async execute(interaction) {

    await interaction.deferReply();

    let user = interaction.user;
    const userOption = interaction.options.getUser('user');
    const yearOption = interaction.options.getInteger('year');
    const sortingOption = interaction.options.getInteger('sorting');

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

    const labels = [];
    const values = [];

    for (let i = 0; i < gameIds.length; i++) {
      const game = beatGameIGDBEntries.find(item => item.id === gameIds[i]);
      const date1 = new Date(game.first_release_date * 1000);
      const date2 = new Date();
      const differenceInMilliseconds = Math.abs(date2 - date1);
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      values.push(differenceInDays / 365);
    }

    switch (sortingOption) {
      case 1:
        values.sort((a, b) => b - a);
        break;
      case 2:
        values.sort((a, b) => a - b);
        break;
      default:
        break;
    }

    for (let i = 0; i < values.length; i++) {
      labels.push(i + 1);
    }

    // Create a canvas
    const canvas = createCanvas(1920, 1080);

    // Chart data
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Games Beat',
          data: values,
          borderColor: '#5865F2',
          backgroundColor: 'rgba(88, 101, 242, 0.5)',
          borderWidth: 8,
          color: 'white',
        },
      ],
    };

    // Chart configuration
    const config = {
      type: 'scatter',
      data,
      options: {
        scales: {
          x: {
            beginAtZero: true,
            min: 0,
            max: labels.length + 1,
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Beat Game Index',
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
          },
          y: {
            beginAtZero: true,
            min: 0,
            type: 'linear',
            title: {
              display: true,
              text: 'Game Age',
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
            text: `${user.username}'s beat games age`,
            font: {
              size: 64,
              family: 'Tahoma',
            },
            color: 'white',
          },
          legend: {
            labels: {
              color: 'white',
              font: {
                size: 24,
                family: 'Tahoma',
              },
            },
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