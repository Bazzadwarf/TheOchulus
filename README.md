![The Ochulus logo](logo.png)

The Ochulus is a simple personal discord bot used for tracking games completed during a 100 Game Challenge.

# Requirements

## Software

- Node.js (version v21.2.0 or later)
- npm (version 10.2.3 or later)

## API Keys

- Discord Developer Application
- IGDB Developer Application

# How to deploy

0. Create accounts and install software
    1. [Download and install Node.js and npm](https://nodejs.org/en).
    1. [Create Discord Developer Application](https://discord.com/developers/applications).
    2. [Create IGDB Developer Application](https://www.igdb.com/api).
1. Create `.env` using `.env.template`
    1. Populate `discordClientId`, `discordGuildId` and `discordToken` with your Discord Developer Application details.
    2. Populate `igdbClientId` and `igdbClientSecret` with your IGDB Developer Application details.
2. Run `npm install` to install Node Packages
3. Run `node .\dbInit.js` to create database.
4. Run `node .\deploy-commands.js` to deploy commands to your guild
5. Run `node .\index.js` to run the bot.