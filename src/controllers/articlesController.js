const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());
// const {executablePath} = require('puppeteer') 

const URL = 'https://www.warhammer-community.com/latest-news-features/';

async function getNewArticles() {
    console.time('Articles fetching');

    const browser = await puppeteer.launch({headless: 'new'});
    let page = await browser.newPage();

    try {
        await Promise.all([
            page.goto(URL, {timeout: 60000}),
            page.waitForNavigation()
        ]);

        // Extract informations from articles on the page
        const articles = await page.evaluate(() =>
            Array.from(document.querySelectorAll('#articles .post-item'), (element) => ({
                title: element.querySelector('.post-item__content h3').innerText,
                cover: window.getComputedStyle(element.querySelector('.post-item__thumb .post-item__img-container')).getPropertyValue('background-image').match(/url\("(.+)"\)/)[1],
                desc: element.querySelector('.post-item__content .post-feed__excerpt p').innerText,
                url: element.href,
                date: element.querySelector('.post-item__content .post-item__date').innerText
            }))
        );

        let knownArticles = [];
        if(fs.existsSync('articles.json')) {
            // Read known articles from JSON file
            knownArticles = JSON.parse(fs.readFileSync('articles.json', 'utf-8'));
        } else {
            // Create JSON file if it doesn't exist
            fs.writeFileSync('articles.json', JSON.stringify([], null, 2), 'utf-8');
        }

        // Filter out new articles (articles not already present in the file)
        const newArticles = articles.filter(newArticle => !knownArticles.some(oldArticle => JSON.stringify(newArticle) === JSON.stringify(oldArticle)));

        // Add new articles to the known articles
        fs.writeFileSync('articles.json', JSON.stringify([...newArticles, ...knownArticles], null, 2), 'utf-8');

        console.timeEnd('Articles fetching');
        console.log(`${articles.length} ${articles.length === 1 ? 'article' : 'articles'} fetched`);
        console.log(`${newArticles.length} new ${newArticles.length === 1 ? 'article' : 'articles'}`);

        return newArticles.reverse();
    } finally {
        await browser.close();
    }
}

module.exports = {
    async sendArticles(client) {
        console.log(`\x1b[90m${new Date().toLocaleString()}\x1b[37m`);
    
        let articles = await getNewArticles();
        if(articles.length > 0) {
            console.time('Messages sending');
    
            let messagesCount = 0;
            const promises = [];
            // For each guild the bot is in
            client.guilds.cache.forEach(guild => {
                // For each channel the bot has access to
                guild.channels.cache.forEach(channel => {
                    // If the channel is a text channel and the bot has the required permissions to send messages
                    if (channel.type == 0 && channel.permissionsFor(client.user).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.EmbedLinks])) {
                        // For each article send a message
                        articles.forEach(article => {
                            const embed = new EmbedBuilder()
                                .setTitle(article.title)
                                .setImage(article.cover)
                                .setDescription(article.desc)
                                .addFields(
                                    {name: '\u200B', value: article.date}
                                )
                                .setURL(article.url);
    
                            // Promise that the message has been sent
                            const promise = channel.send({embeds: [embed]})
                                .then(message => {
                                    // If the bot has the required permissions to add reactions
                                    if (channel.permissionsFor(client.user).has([PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ReadMessageHistory])) {
                                        return Promise.all([
                                            message.react('👍'),
                                            message.react('😐'),
                                            message.react('👎')
                                        ]);
                                    }
                                }).then(() => {
                                    messagesCount++;
                                });
    
                            promises.push(promise);
                        });
                    }
                });
            });
    
            // Waits until all messages have been sent
            await Promise.all(promises);
    
            console.timeEnd('Messages sending');
            console.log(`${messagesCount} ${messagesCount === 1 ? 'message' : 'messages'} sent`);
        }
        console.log();
    }
};