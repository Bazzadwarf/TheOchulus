const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserRegistration, checkGameStorageId, getBeatenGames } = require('../../databaseHelperFunctions.js');
const { getGameJson, getTimesToBeat } = require('../../igdbHelperFunctions.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('totalbeatlength')
    .setDescription('Calculate the time taken to beat every game on a users beat games list.')
    .addUserOption(option => option.setName('user').setDescription('The user to check'))
    .addBooleanOption(option => option.setName('showmissing').setDescription('Replaces the output with a list of games with missing length information')),
    async execute(interaction) {
        await interaction.deferReply();

        let user = interaction.user;
        const userOption = interaction.options.getUser('user');
        const showmissingOption = interaction.options.getBoolean('showmissing');

        if (userOption) {
            user = userOption;
        }

        const userDatabaseEntry = await getUserRegistration(user);
        if (!userDatabaseEntry) return interaction.editReply({ content: `Issue checking registration with "${user.username}".`, ephemeral: true });

        const beatenGamesDatabaseEntries = await getBeatenGames(userDatabaseEntry.id);

        if (!beatenGamesDatabaseEntries || beatenGamesDatabaseEntries.length == 0) {
            const embed = new EmbedBuilder()
            .setTitle(`${user.displayName}'s time spent beating games`)
            .setThumbnail(user.avatarURL())
            .setDescription(`${user.username} has not beat any games`)
            .setTimestamp()
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setColor(0xFF0000);
            return interaction.editReply({ embeds: [embed] });
        }

        const gameIds = [];

        for (let i = 0; i < beatenGamesDatabaseEntries.length; i++) {
            const game = await checkGameStorageId(beatenGamesDatabaseEntries[i].gameId);
            gameIds.push(game.igdb_id);
        }

        let beatGameIGDBEntries = await getGameJson(String.prototype.concat(`where id = (${gameIds}); fields *; limit ${gameIds.length};`));

        const timings = [];
        const timeData = await getTimesToBeat(`where game_id = (${gameIds}); fields *; limit ${gameIds.length};`);

        if (!timeData || timeData.length == 0) {
            const embed = new EmbedBuilder()
            .setTitle(`${user.displayName}'s time spent beating games`)
            .setThumbnail(user.avatarURL())
            .setDescription('Not enough data to calculate a valid number.')
            .setTimestamp()
            .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
            .setColor(0xFF0000);
            return interaction.editReply({ embeds: [embed] });
        }

        let average;
        let desc = ' ';

        if (!showmissingOption) {
            for (let i = 0; i < timeData.length; i++)
            {
                if (timeData[i])
                {
                    if (timeData[i].normally) { timings.push(timeData[i].normally / 3600); }
                    else if (timeData[i].hastily) { timings.push(timeData[i].hastily / 3600); }
                }
            }

            average = Math.round(timings.reduce((sum, num) => sum + num, 0));
            desc = `${user.displayName} has spent an estimated **${average} hours** beating games for the 100 games challenge *(${timings.length} of ${beatenGamesDatabaseEntries.length} included)*. `;
        } else {
            for (let i = 0; i < timeData.length; i++)
            {
                if (timeData[i].normally || timeData[i].hastily)
                {
                    beatGameIGDBEntries = beatGameIGDBEntries.filter(item => item.id !== timeData[i].game_id);
                }
            }

            if (beatGameIGDBEntries.length > 0)
            {
                desc = beatGameIGDBEntries.map(item => `[${item.name}](<${item.url}>)`).join('\n');
            } else {
                desc = 'No games have missing data.';
            }

        }

        const embed = new EmbedBuilder()
        .setColor(0x6441a5)
        .setThumbnail(user.avatarURL())
        .setTitle(`${user.displayName}'s time spent beating games`)
        .setDescription(desc)
        .setFooter({ text: 'The Ochulus • 100 Games Challenge', iconURL: interaction.client.user.avatarURL() })
        .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};