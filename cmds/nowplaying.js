const { error, lfmGetUsername, lfmGetNowPlaying, lfmGetTrackInfo, lfmGetArtistInfo } = require('../functions.js');
const { getAverageColor } = require('fast-average-color-node');

module.exports = {
    name: 'Now Playing',
    aliases: [ 'np', 'nowplaying' ],
    group: 'recent scrobbles',
    description: 'Displays your current song.',
    async run(client, msg, db) {
        // Acquire last.fm username and profile.
        let mention = msg.mentions.users.first();
        let user = msg.author;

        if (mention) user = mention;
        
        let lastFMUser = await lfmGetUsername(user.id, db);

        // If user has not set Last.FM.
        if (!lastFMUser) return error(msg.channel, 'No Last.FM Set', 'Please set your Last.FM with `;setfm`');

        let nowplaying = await lfmGetNowPlaying(lastFMUser);
        // console.log(nowplaying)

        // If no song has ever been played.
        if (!nowplaying) return error(msg.channel, 'No Plays', 'Start scrobbling to use this command!');

        // Get track and artist info for scrobble counts.
        let trackInfo = await lfmGetTrackInfo(lastFMUser, nowplaying.artist['#text'], nowplaying.name);
        let artistInfo = await lfmGetArtistInfo(lastFMUser, nowplaying.artist['#text']);

        // console.log(trackInfo);
        // console.log(artistInfo);

        let trackTitle = nowplaying.name;
        let trackURL = nowplaying.url;
        let trackArtist = nowplaying.artist['#text'];
        let trackAlbum = nowplaying.album['#text'];
        let trackImage = nowplaying.image[3]['#text'];
        let trackScrobbles = trackInfo.userplaycount;
        let artistScrobbles = artistInfo.stats.userplaycount;
        let trackColor = await getAverageColor(trackImage);
        
        // Send nowplaying embed.
        let responseMessage = await msg.channel.send({ embeds: [
            {
                title: `${user.username} - Now Playing:`,
                url: trackURL,
                fields: [
                    {
                        name: 'Track',
                        value: trackTitle,
                        inline: true
                    },
                    {
                        name: 'Artist',
                        value: trackArtist,
                        inline: true
                    },
                    {
                        name: 'Album',
                        value: trackAlbum,
                        inline: false
                    }
                ],
                footer: { text: `Track Scrobbles: ${trackScrobbles} | Artist Scrobbles: ${artistScrobbles}` },
                thumbnail: { url: trackImage },
                color: trackColor.hex
            }
        ]});

        // Like/dislike reacts.
        responseMessage.react('👍').then(() => {
            return responseMessage.react('👎');
        })
    }
}