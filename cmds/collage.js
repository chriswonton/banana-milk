const { error, lfmGetUsername, lfmGetNowPlaying, lfmGetTrackInfo, lfmGetArtistInfo } = require('../functions.js');
const { getAverageColor } = require('fast-average-color-node');

module.exports = {
    name: 'Collage',
    aliases: [ 'collage' ],
    group: 'other',
    description: 'Displays a collage based on your top scrobbles.',
    async run(client, msg, db) {
        // Acquire last.fm username and profile.
        let mention = msg.mentions.users.first();
        let user = msg.author;

        if (mention) user = mention;
        
        let lastFMUser = await lfmGetUsername(user.id, db);

        // If user has not set Last.FM.
        if (!lastFMUser) return error(msg.channel, 'No Last.FM Set', 'Please set your Last.FM with `;setfm`');
        
        return await msg.channel.send(`https://tapmusic.net/collage.php?user=${lastFMUser}&type=12month&size=5x5`);
    }
}