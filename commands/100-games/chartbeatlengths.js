const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
const fs = require('fs');
const { getUserRegistration, getBeatenGames, checkGameStorageId } = require('../../databaseHelperFunctions.js');
const { getGameJson, getTimesToBeat } = require('../../igdbHelperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
	.setName('chartbeatlengths')
	.setDescription('Generate a line graph of the games beat over time')
    .addUserOption(option => option.setName('user1').setDescription('The user to check')),
	async execute(interaction) {

    await interaction.deferReply();

    let user = interaction.user;
    const userOption = interaction.options.getUser('user1');


    if (userOption) {
        user = userOption;
    }

    const userDatabaseEntry = await getUserRegistration(user);
    if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

    const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);

    if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
        const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s beat games lengths`)
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

    const timeData = await getTimesToBeat(`where game_id = (${gameIds}); fields *; limit ${gameIds.length};`);

    if (!timeData || timeData.length == 0) {
        const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s beat games lengths`)
        .setThumbnail(user.avatarURL())
        .setDescription('Not enough data to calculate a valid number.')
        .setTimestamp()
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setColor(0xFF0000);
        return interaction.editReply({ embeds: [embed] });
    }

    // TODO: Code to generate data here
    const labels = [];
    const values = [];
    const backgroundColors = [];

    for (let i = 0; i < timeData.length; i++) {
        if (timeData[i])
        {
            if (timeData[i].normally)
            {
                values.push(timeData[i].normally / 3600);
                const game = beatGameIGDBEntries.filter(item => item.id == timeData[i].game_id);
                labels.push(`${game[0].name}, ${Math.round(timeData[i].normally / 3600)} hours`);
                backgroundColors.push(`rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`);
            }
            else if (timeData[i].hastily)
            {
                values.push(timeData[i].hastily / 3600);
                const game = beatGameIGDBEntries.filter(item => item.id == timeData[i].game_id);
                labels.push(`${game[0].name}, ${Math.round(timeData[i].hastily / 3600)} hours`);
                backgroundColors.push(`rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`);
            }
        }
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
            borderColor: backgroundColors,
            backgroundColor: backgroundColors,
            borderWidth: 8,
            color: 'white',
        },
        ],
    };

    // Chart configuration
    const config = {
        type: 'pie',
        data,
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `${user.username}'s beat games lengths`,
                    font: {
                        size: 64,
                        family: 'Tahoma',
                    },
                    color: 'white',
                },
                legend: {
                    display: false,
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, context) => {
                        return context.chart.data.labels[context.dataIndex];
                    },
                    anchor: 'center',
                    align: 'end',
                    offset: 200,
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