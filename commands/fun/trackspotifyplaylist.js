const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const { getAllPlaylistTracks } = require('./postnewplaylistupdates.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('trackspotifyplaylist')
	.setDescription('Tracks for changes in a spotify playlist and posts updates in the channel this message is sent')
    .addStringOption(option => option.setName('playlisturl').setDescription('A link to the playlist to track.').setRequired(true)),
	async execute(interaction) {

        await interaction.deferReply();

        const playlistURL = interaction.options.getString('playlisturl');
        const lastIndexOf = playlistURL.lastIndexOf('/');
        const playlistID = playlistURL.substr(lastIndexOf + 1);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setTimestamp();

        await fetch(
            `https://api.spotify.com/v1/playlists/${playlistID}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.spotifyAccessToken}`,
                },
            },
        )
        .then(response => response.json())
        .then(response => {
            embed.setColor(0x1db954);
            embed.setTitle(`Now tracking ${response.name}`);
            embed.setURL(response.external_urls.spotify);

            if (response.images) {
                embed.setThumbnail(`${response.images[0].url}`);
            }

            embed.setDescription(`There are currently ${response.tracks.total} tracks in the playlist.`);

            console.log(response);
            process.env.spotifyPlaylistTracking = response.id;
            process.env.spotifyPlaylistChannel = interaction.channelId;
            // Save to file

            const list = [];
            list.push(process.env.spotifyPlaylistTracking);
            list.push(process.env.spotifyPlaylistChannel);
            fs.writeFileSync('./playlistinfo.json', JSON.stringify(list));
        })
        .catch(err => {
            embed.setColor(0xFF0000);
            embed.setTitle('Unable to track playlist');
            console.error(err);
        });

        if (process.env.spotifyPlaylistTracking) {
            const allTracks = await getAllPlaylistTracks();
            const ids = allTracks.map(item => item.track.id);
            fs.writeFileSync('./playlistContent.json', JSON.stringify([...ids]));
        }

        await interaction.editReply({ embeds: [embed] });
    },
};