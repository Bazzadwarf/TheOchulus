const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { deleteTrackedPlaylist } = require('../../databaseHelperFunctions.js');
const { getSpotifyPlaylistDetails } = require('../../spotifyHelperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('deletespotifyplaylist')
	.setDescription('Deletes a tracked spotify playlist')
    .addStringOption(option => option.setName('spotifyplaylisturl').setDescription('A link to the spotify playlist to delete.').setRequired(true)),
	async execute(interaction) {

        await interaction.deferReply();

        const spotifyPlaylistURL = interaction.options.getString('spotifyplaylisturl');
        const lastIndexOf = spotifyPlaylistURL.lastIndexOf('/');
        let playlistID = spotifyPlaylistURL.substr(lastIndexOf + 1);


        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        const response = await getSpotifyPlaylistDetails(playlistID);

        if (response) {
            playlistID = response.id;
            deleteTrackedPlaylist(playlistID, interaction.channelId);

            embed.setColor(0xFF0000);
            embed.setTitle(`Deleted ${response.name} from tracking`);
            embed.setURL(response.external_urls.spotify);

            if (response.images) {
                embed.setThumbnail(`${response.images[0].url}`);
            }
        }
        else {
            embed.setColor(0xFFFF00);
            embed.setTitle('Problem deleting playlist');
            embed.setDescription('There was a problem deleting the playlist.');
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

