const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('info')
	.setDescription('Info about the bot.'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
        .setColor(0xD36918)
        .setTitle('The Ochulus')
        .setThumbnail(interaction.client.user.avatarURL())
        .setDescription('The Ochulus is a Discord bot used for tracking games for the 100 Games Challenge.\n\n **Commands**\nAll commands can be viewed using the Discord slash command panel when typing a new command. Alternatively, you can view all the commands on the [Github Repository](https://github.com/Bazzadwarf/TheOchulus?tab=readme-ov-file#commands).\n\n **Source Code**\n You can view the source code for The Ochulus on [Github](https://github.com/Bazzadwarf/TheOchulus) or [Sauce Control](https://sauce.pizzawednes.day/baz/TheOchulus).\n\n **Misc**\n The Ochulus was originally writted by [baz](https://github.com/Bazzadwarf), it is open to new contributions, contributors and feature requests.')
        .setTimestamp();

		return interaction.reply({ embeds: [embed] });
	},
};