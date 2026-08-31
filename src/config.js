const fs = require('node:fs');

// Check if the .env file exists
if (!fs.existsSync('.env')) {
    throw new Error('Missing .env file. Please create one with the necessary environment variables.');
}

// Load environment variables from .env file
const { config } = require('dotenv');
config();

// Validate required environment variables
const { validateEnvVariables } = require('./env.js');
validateEnvVariables(['discordClientId', 'discordGuildId', 'discordToken', 'igdbClientId', 'igdbClientSecret', 'googleplacesapikey', 'spotifyClientId', 'spotifyClientSecret']);

module.exports = { 
    discordClientId: process.env.discordClientId,
    discordGuildId: process.env.discordGuildId,
    discordToken: process.env.discordToken,
    igdbClientId: process.env.igdbClientId,
    igdbClientSecret: process.env.igdbClientSecret,
    igdbAccessToken: process.env.igdbAccessToken,
    googleplacesapikey: process.env.googleplacesapikey,
    spotifyClientId: process.env.spotifyClientId,
    spotifyClientSecret: process.env.spotifyClientSecret,
    spotifyAccessToken: process.env.spotifyAccessToken
 };