const fs = require('fs');

async function backupDatabase() {
    const date = new Date().toJSON().slice(0, 10);

    if (fs.existsSync('./database.sqlite')) {
        // I know that this is probably not the best way to do this but for now it is fine.
        fs.copyFile('./database.sqlite', String.prototype.concat('./backups/database-', date, '.sqlite'), (err) => {
            console.log(err);
        });
    }
}

module.exports = {
    backupDatabase
}