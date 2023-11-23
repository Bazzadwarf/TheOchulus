import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('och')
	.setDescription('och');	

export async function execute(interaction) {
	await interaction.reply('och');	
}