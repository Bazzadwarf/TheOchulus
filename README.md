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

# Commands

A list of current commands that can be accessed by all users.

## /beatgame

Log a beat game towards the 100 Game Challenge.

**Parameters:**

*Note: One parameter is required.*

- **Required**
    - `gamename` - The name of the game.
    - `gameid` - The IGDB game ID.

## /beatlist

Show a list of games the user has beaten.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /currentlyplaying

Show the list of games the user are currently playing.

**Parametes:**
- *Optional*
    - `user` - The username of a user to check.

## /deletebeatengame

Deletes a game from the users beaten games.

**Parameters:**

*Note: If no parameter is supplied, the latest beat game is deleted.*

- *Optional*
    - `beatgamenumber` - The number of the beat game entry to delete.

## /deleteplannedgame

Deletes a game from the users planned games.

**Parametes:**
- *Optional*
    - `currentgamenumber` - The number of the current game entry to delete.

## /deleteplayinggame

Deletes a game from the users currently playing games.

**Parametes:**
- *Optional*
    - `currentgamenumber` - The number of the current game entry to delete.

## /estimatedfinishdate

Get an estimated date as to when a user will finish the 100 games challenge.

**Parametes:**
- *Optional*
    - `user` - The username of a user to check.

## /gamedetails

Get the details of a game from the IGDB database.

**Parameters:**

*Note: Only one parameter is required.*

- **Required**
    - `gamename` - The name of the game.
    - `gameid` - The IGDB game ID.

## /globalbeatlist

Show a list of all games beaten for the 100 games challenge in chronological order.

## /info

Get info on the bot.

## /leaderboard

Shows the leaderboard for the 100 Game Challenge.

## /plangame

Log a planned game into a list of planned games.

**Parameters:**

*Note: One parameter is required.*

- **Required**
    - `gamename` - The name of the game.
    - `gameid` - The IGDB game ID.

## /plannedgames

Show a list of games the user has planned.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /och

Responds "*och*".

## /randomgame

Get a random game from the IGDB database.

**Parameters:**

- *Optional*
    - `madness` - Remove restrictions on the games the bot can search for.

## /randomplannedgame

Get a random planned game from the list of a users planned games.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /recentbeat

Get the most recent game a given user has beaten.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /recentplanned

Get the most recent game a given user has planned.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /recentplaying

Get the most recent game a given user has started playing.

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.

## /register

Manually registers the user into the 100 Games Challenge.

## /searchgames

Searches the IGDB database for a list of matching games.

**Parameters:**

- **Required**
    - `gamename` - The name of the game.

## /startplaying

Log a game into a list of currently playing games.

**Parameters:**

*Note: One parameter is required.*

- **Required**
    - `gamename` - The name of the game.
    - `gameid` - The IGDB game ID.

## /user

Get the users info for the 100 Game Challenge

**Parameters:**

- *Optional*
    - `user` - The username of a user to check.