const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('uptime')
	.setDescription('Get the current application uptime'),
	async execute(interaction) {
        const uptimeInSeconds = process.uptime();

        let currentUptime = '';
        let databaseBackup = '';

        const days = Math.floor(uptimeInSeconds / (3600 * 24));
        if (days > 0) {
            currentUptime = currentUptime.concat(`${days} days `);
        }

        const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
        if (hours > 0) {
            currentUptime = currentUptime.concat(`${hours} hours `);
            databaseBackup = databaseBackup.concat(`${hours} hours `);
        }

        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        if (minutes > 0) {
            currentUptime = currentUptime.concat(`${minutes} minutes `);
            databaseBackup = databaseBackup.concat(`${minutes} minutes `);
        }

        const seconds = Math.floor(uptimeInSeconds % 60);
        if (seconds > 0) {
            currentUptime = currentUptime.concat(`${seconds} seconds `);
            databaseBackup = databaseBackup.concat(`${seconds} seconds `);
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSecond = now.getSeconds();
        const currentDate = `${currentYear}/${currentMonth}/${currentDay} ${currentHour}:${currentMinute}:${currentSecond}`;

        const embed = new EmbedBuilder()
        .setColor(0xD36918)
        .setTitle('Current Uptime')
        .setThumbnail(interaction.client.user.avatarURL())
        .setDescription(`The current uptime is **${currentUptime}**.\nThe last database backup was **${databaseBackup}**ago.\nThe current local time is **${currentDate}**.`)
        .setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};