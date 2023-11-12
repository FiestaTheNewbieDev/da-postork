const dotenv = require('dotenv');
const {Client, IntentsBitField, Collection} = require('discord.js');

dotenv.config();

const client = new Client({intents: [
    IntentsBitField.Flags.Guilds
]});

client.commands = new Collection();

require('./handlers/eventsHandler')(client);
require('./handlers/commandsHandler')(client);

process.on('exit', code => {console.error('\x1b[31m' + `Process terminated. Error code: ${code}` + '\x1b[37m');});
process.on('uncaughtException', (error, origin) => {console.error('\x1b[31m' + `Uncaught Exception: An unexpected error occurred. Error: ${error}. Origin: ${origin}` + '\x1b[37m');});
process.on('unhandledRejection', (reason, promise) => {console.error('\x1b[31m' + `Unhandled Exception: An unexpected error occurred. Reason: ${reason}. Promise: ${promise}` + '\x1b[37m');});
process.on('warning', (...args) => console.warn('\x1b[33m' + args + '\x1b[37m'));

client.login(process.env.DISCORD_TOKEN);