const {promisify} = require('util');
const {glob} = require('glob');
const pGlob = promisify(glob);
const path = require('path');

// !WARNING! Handlers work only if glob is version 7.2.0

async function loadEvents(client, dir) {
    const files = await pGlob(path.join(dir, '*.js'));

    for (const eventFile of files) {
        const event = require(eventFile);

        if(!event.name || !eventsList.includes(event.name)) throw new Error(`Unknown event -> ${eventFile}`);

        if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
        else client.on(event.name, (...args) => event.execute(client, ...args));

        console.log(`Event loaded: ${event.name}`);
    }

    const subdirs = await pGlob(path.join(dir, '*/'));

    for (const subdir of subdirs) await loadEvents(client, subdir);
}

module.exports = async (client) => {
    await loadEvents(client, path.join(process.cwd(), 'src/events'));
};

const eventsList = ['apiRequest', 'apiResponse', 'applicationCommandCreate', 'applicationCommandDelete', 'applicationCommandUpdate', 'channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'debug', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'error', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildIntegrationsUpdate', 'guildMemberAdd', 'guildMemberAvailable', 'guildMemberRemove', 'guildMembersChunk', 'guildMemberUpdate', 'guildScheduledEventCreate', 'guildScheduledEventDelete', 'guildScheduledEventUpdate', 'guildScheduledEventUserAdd', 'guildScheduledEventUserRemove', 'guildUnavailable', 'guildUpdate', 'interaction', 'interactionCreate', 'invalidated', 'invalidRequestWarning', 'inviteCreate', 'inviteDelete', 'message', 'messageCreate', 'messageDelete', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageReactionRemoveEmoji', 'messageUpdate', 'presenceUpdate', 'rateLimit', 'ready', 'roleCreate', 'roleDelete', 'roleUpdate', 'shardDisconnect', 'shardError', 'shardReady', 'shardReconnecting', 'shardResume', 'stageInstanceCreate', 'stageInstanceDelete', 'stageInstanceUpdate', 'stickerCreate', 'stickerDelete', 'stickerUpdate', 'threadCreate', 'threadDelete', 'threadListSync', 'threadMembersUpdate', 'threadMemberUpdate', 'threadUpdate', 'typingStart', 'userUpdate', 'voiceStateUpdate', 'warn', 'webhookUpdate'];