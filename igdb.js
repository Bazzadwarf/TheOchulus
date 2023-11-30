class igdb {
    constructor() {
        // make a new token every day
        setInterval(() => {
            this.makeClientCred();
        }, 86000000);
        this.makeClientCred();
    }

   makeClientCred() {
    console.log('Making a token');

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
        process.env.igdbAccessToken = resp.body.access_token;
    })
    .catch(err => {
        console.error(err);
    })
    .finally();
    }
}

module.exports = {
    igdb,
};