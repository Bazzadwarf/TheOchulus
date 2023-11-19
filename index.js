// Require the necessary discord.js classes
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

import { config } from 'dotenv';
config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(pathToFileURL(filePath));

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
	const event = await import(pathToFileURL(filePath));
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

fetch(
	`https://id.twitch.tv/oauth2/token?client_id=${process.env.igdbClientId}&client_secret=${process.env.igdbClientSecret}&grant_type=client_credentials`,
	{
		method: 'POST',
	},
)
.then(r => r.json().then(data => ({ status: r.status, headers: r.headers, body: data })))
.then(resp => {
	if (resp.status != 200) {
		console.log('Failed with ', resp.status, resp.body);
		return;
	}
	console.log(resp.body.access_token);
})
.catch(err => {
	console.error(err);
})
.finally();

client.login(process.env.token);