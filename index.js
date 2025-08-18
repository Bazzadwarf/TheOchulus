// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const { config } = require('dotenv');
config();

const { igdb } = require('./igdb.js');
const { backupDatabase } = require('./databaseHelperFunctions.js');
new igdb();

const { Spotify } = require('./spotify.js');
new Spotify();
const { PostNewPlaylistUpdates } = require('./commands/fun/postnewplaylistupdates.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.discordToken);

client.once(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

require('sequelize');
require('./dbObjects.js');

if (!fs.existsSync('./backups')) {
	fs.mkdir('./backups', (err) => {
		console.log(err);
	});
}

setInterval(() => {
	backupDatabase();
}, 86000000);

backupDatabase();


if (fs.existsSync('./playlistinfo.json')) {
	const info = JSON.parse(fs.readFileSync('./playlistinfo.json'));
	process.env.spotifyPlaylistTracking = info[0];
	process.env.spotifyPlaylistChannel = info[1];
}

setInterval(() => {
	PostNewPlaylistUpdates(client);
}, 300000);

PostNewPlaylistUpdates(client);