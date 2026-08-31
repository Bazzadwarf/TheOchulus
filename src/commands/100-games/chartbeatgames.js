const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGamesForYear } = require('../../databaseHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartbeatgames')
	.setDescription('Generate a line graph of the games beat over time')
  .addUserOption(option => option.setName('user1').setDescription('The first user to check'))
  .addUserOption(option => option.setName('user2').setDescription('The second user to check'))
  .addIntegerOption(option => option.setName('year').setDescription('The year to check').addChoices({ name: '2024', value: 2024 }, { name: '2025', value: 2025 }, { name: '2026', value: 2026 })),
	async execute(interaction) {

    await interaction.deferReply();

    const userOption = interaction.options.getUser('user1');
    const user = (userOption) ? userOption : interaction.user;
    const user2 = interaction.options.getUser('user2');

    const yearOption = interaction.options.getInteger('year');
    const start = (yearOption) ? new Date(yearOption, 0, 1) : new Date(2024, 0, 1);
    const end = (yearOption) ? new Date(yearOption, 11, 31) : new Date();

    if (user && user2 && user != user2) {
      GenerateTwoUserChart(user, user2, interaction, start, end);
    }
    else {
      GenerateSingleUserChart(user, interaction, start, end);
    }
	},
};

async function GenerateSingleUserChart(user, interaction, start, end) {
  const userDatabaseEntry = await getUserRegistration(user);
  if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

  const beatenGamesDatabaseEntries = await getBeatenGamesForYear(userDatabaseEntry.id, start, end);

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
    const date2 = start;
    const differenceInMilliseconds = date1 - date2;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    labels.push(differenceInDays);
    values.push(i + 1);
  }

  const date1 = (end > new Date()) ? new Date() : end;
  const date2 = start;
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
}

async function GenerateTwoUserChart(user1, user2, interaction, start, end) {
  const user1DatabaseEntry = await getUserRegistration(user1);
  if (!user1DatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user1.username}".`, ephemeral: true });

  const user1BeatenGamesDatabaseEntries = await getBeatenGamesForYear(user1DatabaseEntry.id, start, end);

  if (!user1BeatenGamesDatabaseEntries || user1BeatenGamesDatabaseEntries.length == 0) {
    const embed = new EmbedBuilder()
    .setTitle(`${user1.username}'s beat games total over time`)
    .setDescription(`${user1.username} has not beat any games`)
    .setColor(0xFF0000);
    return interaction.editReply({ embeds: [embed] });
  }

  const user2DatabaseEntry = await getUserRegistration(user2);
  if (!user1DatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user2.username}".`, ephemeral: true });

  const user2BeatenGamesDatabaseEntries = await getBeatenGamesForYear(user2DatabaseEntry.id, start, end);

  if (!user2BeatenGamesDatabaseEntries || user2BeatenGamesDatabaseEntries.length == 0) {
    const embed = new EmbedBuilder()
    .setTitle(`${user2.username}'s beat games total over time`)
    .setDescription(`${user2.username} has not beat any games`)
    .setColor(0xFF0000);
    return interaction.editReply({ embeds: [embed] });
  }

  const combined = [];

  for (let i = 0; i < user1BeatenGamesDatabaseEntries.length; i++) {
    const date1 = new Date(user1BeatenGamesDatabaseEntries[i].statusLastChanged);
    const date2 = start;
    const differenceInMilliseconds = date1 - date2;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    combined.push([user1.username, differenceInDays, i + 1]);
  }

  for (let i = 0; i < user2BeatenGamesDatabaseEntries.length; i++) {
    const date1 = new Date(user2BeatenGamesDatabaseEntries[i].statusLastChanged);
    const date2 = start;
    const differenceInMilliseconds = date1 - date2;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    combined.push([user2.username, differenceInDays, i + 1]);
  }

  combined.sort((a, b) => a[1] - b[1]);

  const labels = [0];

  const user1values = [0];
  const user2values = [0];

  for (let i = 0; i < combined.length; i++) {
    if (combined[i][0] == user1.username) {
      labels.push(combined[i][1]);
      user1values.push(combined[i][2]);
      user2values.push(null);
    }
    else {
      labels.push(combined[i][1]);
      user1values.push(null);
      user2values.push(combined[i][2]);
    }
  }

  const date1 = (end > new Date()) ? new Date() : end;
  const date2 = start;
  const differenceInMilliseconds = date1 - date2;
  const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  // Create a canvas
  const canvas = createCanvas(1920, 1080);

  // Chart data
  const data = {
    labels: labels,
    datasets: [
      {
        label: user1.username,
        data: user1values,
        borderColor: '#5865F2',
        backgroundColor: 'rgba(88, 101, 242, 0.5)',
        borderWidth: 8,
        color: 'white',
      },
      {
        label: user2.username,
        data: user2values,
        borderColor: '#f25858',
        backgroundColor: 'rgba(242, 88, 88, 0.5)',
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
      elements: {
        line: {
          spanGaps: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: `${user1.username} vs ${user2.username} beat games total over time`,
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
}