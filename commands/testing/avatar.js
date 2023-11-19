import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar URL of the selected user, or your own avatar.')
    .addUserOption(option => option.setName('user').setDescription('The user\'s avatar to show'));

export async function execute(interaction) {
    const user = interaction.options.getUser('user');
    if (user) return interaction.reply(`${user.username}'s avatar: ${user.displayAvatarURL()}`);
    return interaction.reply(`Your avatar: ${interaction.user.displayAvatarURL()}`);
}