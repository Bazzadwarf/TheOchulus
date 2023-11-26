const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('och')
	.setDescription('och'),
	async execute(interaction) {
		await interaction.reply('och');
	},
};