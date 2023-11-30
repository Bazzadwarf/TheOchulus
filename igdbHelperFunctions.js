async function getCoverURL(id) {
    let url = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';

    await fetch(
        'https://api.igdb.com/v4/covers',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields url;`,
        })
        .then(response => response.json())
        .then(response => {
            if (response[0]) {
                url = 'https:'.concat(response[0].url);
            }
        })
        .then(response => {
            url = url.replace('t_thumb', 't_1080p_2x');
        })
        .catch(err => {
            console.error(err);
        });

        return url;
}

async function getPlatformID(platform) {

    await fetch(
        'https://api.igdb.com/v4/platforms',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where name = "${platform}", alternative_name = "${platform}"; fields id;`,
      })
      .then(response => response.json())
      .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
}

async function getGameJson(body) {
    let res;

    await fetch(
        'https://api.igdb.com/v4/games',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: body,
      })
        .then(response => response.json())
        .then(response => {
            res = response;
        })
        .catch(err => {
            console.error(err);
        });

        return res;
}

async function getReleaseDates(id) {
    let date;

    await fetch(
        'https://api.igdb.com/v4/release_dates',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields category,checksum,created_at,date,game,human,m,platform,region,status,updated_at,y;`,
      })
        .then(response => response.json())
        .then(response => {
            date = response[0].human;
        })
        .catch(err => {
            console.error(err);
        });

    return date;
}

module.exports = {
    getCoverURL,
    getPlatformID,
    getGameJson,
    getReleaseDates,
};