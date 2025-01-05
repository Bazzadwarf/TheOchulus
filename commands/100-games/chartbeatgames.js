const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGames } = require('../../databaseHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartbeatgames')
	.setDescription('Generate a line graph of the games beat over time')
  .addUserOption(option => option.setName('user').setDescription('The user to check')),
	async execute(interaction) {

    await interaction.deferReply();

    let user = interaction.user;
    const userOption = interaction.options.getUser('user');

    if (userOption) {
        user = userOption;
    }

    const userDatabaseEntry = await getUserRegistration(user);
    if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

    const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);

    if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
      const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s beat games total over time`)
      .setDescription(`${user.username} has not beat any games`)
      .setColor(0xFF0000);
      return interaction.editReply({ embeds: [embed] });
    }

    const labels = [0];
    const values = [0];

    for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
      const date1 = new Date(beatenGamesDatabaseEntries[i].statusLastChanged);
      const date2 = new Date('2024-01-01');
      const differenceInMilliseconds = date1 - date2;
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      labels.push(differenceInDays);
      values.push(i + 1);
    }

    const date1 = new Date();
    const date2 = new Date('2024-01-01');
    const differenceInMilliseconds = date1 - date2;
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));

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
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            beginAtZero: true,
            min: 0,
            max: differenceInDays,
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Days',
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
              text: 'Games Beat',
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
        },
        plugins: {
          title: {
            display: true,
            text: `${user.username}'s beat games total over time`,
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