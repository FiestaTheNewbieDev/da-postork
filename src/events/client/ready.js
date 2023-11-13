const articlesController = require('../../controllers/articlesController');

// Milliseconds * Seconds * Minutes = 15 minutes
const INTERVAL = 1000 * 60 * 15;

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('\x1b[32m', `\n${client.user.username} ready\n`, '\x1b[37m');

        (async () => await articlesController.sendArticles(client))();
        setInterval(async () => await articlesController.sendArticles(client), INTERVAL);
    }
};