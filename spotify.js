const { spotifyClientId, spotifyClientSecret } = require('./config.js');
let { spotifyAccessToken } = require('./config.js');

class Spotify {
    constructor() {
        // make a new token every hour
        setInterval(() => {
            this.makeClientCred();
        }, 3600000);
        this.makeClientCred();
    }

    async makeClientCred() {
        console.log('Making a spotify token');

        const response = await fetch('https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + (new Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                }),
            },
        );

        const data = await response.json();
            if (response.status != 200) {
            console.log('Failed with ', data.status, data.body);
            return;
        }

        spotifyAccessToken = data.access_token;
    }
}

module.exports = {
    Spotify,
};

