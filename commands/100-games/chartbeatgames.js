const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const fs = require('fs');
const { getUserRegistration, getBeatenGames } = require('../../databaseHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartbeatgames')
	.setDescription('Generate a line graph of the games beat over time')
  .addUserOption(option => option.setName('user1').setDescription('The first user to check'))
  .addUserOption(option => option.setName('user2').setDescription('The second user to check')),
	async execute(interaction) {

    await interaction.deferReply();

    let user = interaction.user;
    const userOption = interaction.options.getUser('user1');

    const user2 = interaction.options.getUser('user2');

    if (userOption) {
        user = userOption;
    }

    if (user && user2 && user != user2) {
      GenerateTwoUserChart(user, user2, interaction);
    }
    else {
      GenerateSingleUserChart(user, interaction);
    }
	},
};

async function GenerateSingleUserChart(user, interaction) {
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
}

async function GenerateTwoUserChart(user1, user2, interaction) {
  const user1DatabaseEntry = await getUserRegistration(user1);
  if (!user1DatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user1.username}".`, ephemeral: true });

  const user1BeatenGamesDatabaseEntries = await getBeatenGames(user1DatabaseEntry.id);

  if (!user1BeatenGamesDatabaseEntries || user1BeatenGamesDatabaseEntries.length == 0) {
    const embed = new EmbedBuilder()
    .setTitle(`${user1.username}'s beat games total over time`)
    .setDescription(`${user1.username} has not beat any games`)
    .setColor(0xFF0000);
    return interaction.editReply({ embeds: [embed] });
  }

  const user2DatabaseEntry = await getUserRegistration(user2);
  if (!user1DatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user2.username}".`, ephemeral: true });

  const user2BeatenGamesDatabaseEntries = await getBeatenGames(user2DatabaseEntry.id);

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
    const date2 = new Date('2024-01-01');
    const differenceInMilliseconds = date1 - date2;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    combined.push([user1.username, differenceInDays, i + 1]);
  }

  for (let i = 0; i < user2BeatenGamesDatabaseEntries.length; i++) {
    const date1 = new Date(user2BeatenGamesDatabaseEntries[i].statusLastChanged);
    const date2 = new Date('2024-01-01');
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

  console.log(labels);
  console.log(user1values);
  console.log(user2values);

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