const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('teleport')
	.setDescription('Teleport to a random location somewhere in the world'),
	async execute(interaction) {

        await interaction.deferReply();

        let latitude;
        let longitude;
        let url;
        let response;
        let data;

        do
        {
            latitude = (Math.random() * 180) - 90;
            longitude = (Math.random() * 360) - 180;
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50000&key=${process.env.googleplacesapikey}`;
            response = await axios.get(url);
            data = response.data;
        } while (data.results.length == 0);

        if (data.results.length > 0) {
            const randomPlace = data.results[Math.floor(Math.random() * data.results.length)];
            const placeName = randomPlace.name;
            const placeId = randomPlace.place_id;

            const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`;

            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.googleplacesapikey}`;
            const detailsResponse = await axios.get(detailsUrl);
            const fullAddress = detailsResponse.data.result.formatted_address;
            const phoneNumber = detailsResponse.data.result.formatted_phone_number || 'No phone number available';
            const website = detailsResponse.data.result.website || 'No website available';
            const rating = detailsResponse.data.result.rating ? `${detailsResponse.data.result.rating}/5` : 'No rating available';
            const openNow = detailsResponse.data.result.opening_hours?.open_now ? 'Yes' : 'No';

            const embed = new EmbedBuilder();
            embed.setAuthor({ name: 'You have been teleported to a new location!', iconURL: interaction.user.avatarURL() });
            embed.setTitle(placeName);
            embed.setDescription(`**Address:** ${fullAddress}`);
            embed.addFields({ name: 'Phone Number', value: phoneNumber, inline: true });
            embed.addFields({ name: 'Website', value: website !== 'No website available' ? `[Visit Website](${website})` : website, inline: true });
            embed.addFields({ name: 'Rating', value: rating, inline: true });
            embed.addFields({ name: 'Open Now', value: openNow, inline: true });
            embed.setURL(mapsLink);
            embed.setTimestamp();
            embed.setColor(0xf9be04);

            if (randomPlace.photos)
            {
                const photoReference = randomPlace.photos[0].photo_reference;
                embed.setThumbnail(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photoReference}&key=${process.env.googleplacesapikey}`);
            }

            embed.setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() });

            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply('Unable to find a location to teleport to!');
        }
	},
};