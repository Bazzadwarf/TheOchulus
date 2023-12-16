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
        .then(url = url.replace('t_thumb', 't_1080p_2x'))
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

async function getCompanyInfo(id) {

    let involved_company;

    await fetch(
        'https://api.igdb.com/v4/involved_companies',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields *;`,
        })
        .then(response => response.json())
        .then(response => {
            involved_company = response[0];
        })
        .catch(err => {
            return console.error(err);
        });

    let developer;

    await fetch(
        'https://api.igdb.com/v4/companies',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${involved_company.company}; fields *;`,
        })
        .then(response => response.json())
        .then(response => {
            developer = response[0];
        })
        .catch(err => {
            console.error(err);
        });

    return developer;
}

async function getGenres(id) {
    let genre;

    await fetch(
        'https://api.igdb.com/v4/genres',
        { method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
          },
          body: `where id = ${id}; fields *;`,
      })
      .then(response => response.json())
      .then(response => {
        genre = response[0];
      })
        .catch(err => {
            console.error(err);
        });

    return genre.name;
}

async function getFranchise(id) {

    let franchise;

    await fetch(
        'https://api.igdb.com/v4/franchises',
        { method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Client-ID': `${process.env.igdbClientId}`,
            'Authorization': `Bearer ${process.env.igdbAccessToken}`,
        },
        body: `where id = ${id}; fields *;`,
    })
    .then(response => response.json())
    .then(response => {
        franchise = response[0];
    })
      .catch(err => {
          console.error(err);
      });

    return franchise.name;
}

module.exports = {
    getCoverURL,
    getPlatformID,
    getGameJson,
    getReleaseDates,
    getCompanyInfo,
    getGenres,
    getFranchise,
};