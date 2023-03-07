const { error, lfmGetUser, lfmGetUsername, lfmGetNowPlaying, lfmGetArtistInfo, lfmArtistSearch } = require('../functions.js');
const { MessageActionRow, MessageButton, Interaction } = require('discord.js');
const { getAverageColor } = require('fast-average-color-node');

module.exports = {
    name: 'Who Knows Artist',
    aliases: [ 'wk', 'whoknows' ],
    group: 'who knows',
    description: 'Displays who in the server knows an artist.',
    async run(client, msg, db, arguments) {
        // Acquire Last.FM username and profile.
        let user = msg.author;
        let serverName = msg.guild.name;

        let artistInfo;
        let mention = msg.mentions.users.first();
        if (!arguments[1] || arguments[1].toLowerCase() == 'np' || mention) {
            if (mention) user = mention;
            
            let lastFMUser = await lfmGetUsername(user.id, db);

            // If user has not set Last.FM.
            if (!lastFMUser) return error(msg.channel, 'No Last.FM Set', 'Please set your Last.FM with `;setfm`');
        
            // Use currently playing song.
            let nowplaying = await lfmGetNowPlaying(lastFMUser);
            // console.log(nowplaying)
    
            // If no song has ever been played.
            if (!nowplaying) return error(msg.channel, 'No Plays', 'Start scrobbling to use this command!');
    
            // Get track and artist info for scrobble counts.
            artistInfo = await lfmGetArtistInfo(lastFMUser, nowplaying.artist['#text']);
        }
        else {
            // Find specified artist.
            arguments.shift();
            let artistName = await lfmArtistSearch(arguments.join(" "));
            artistInfo = await lfmGetArtistInfo('chriswonton', artistName.name);
        }

        let artistImage =  artistInfo.image[3]['#text'];
        let trackArtist = artistInfo.name;
        let trackArtistURL = artistInfo.url;
        let artistColor = await getAverageColor(artistImage);

        let serverInfo = await Promise.resolve(db.db('BananaMilk').collection('servers').findOne({ serverID: msg.guild.id }));
        let users = serverInfo.users;

        let collectivePlays = 0;

        let serverMembers = [];
        let serverUsers = [];
        let artistInfoArr = [];
        let userData = [];

        for (let user of users) {
            let serverLastFMUser = await lfmGetUsername(user, db);
            serverMembers.push(msg.guild.members.fetch(user));
            serverUsers.push(lfmGetUser(serverLastFMUser));
            artistInfoArr.push(lfmGetArtistInfo(serverLastFMUser, trackArtist));
        }
        
        let resolveServerMembers = await Promise.all(serverMembers);
        let resolveServerUsers = await Promise.all(serverUsers);
        let resolveArtistInfo = await Promise.all(artistInfoArr);

        for (let i = 0; i < serverUsers.length; ++i) {
            user = users[i];
            let serverUserName = resolveServerMembers[i];
            let lastFMUserInfo = resolveServerUsers[i];
            let serverArtistInfo = resolveArtistInfo[i];
            let artistScrobbles = serverArtistInfo.stats.userplaycount;
            if (artistScrobbles == 0) continue;
            collectivePlays += parseInt(artistScrobbles);

            let userInfo = {
                username: serverUserName.user.username,
                url: lastFMUserInfo.url,
                scrobbles: artistScrobbles
            }
            userData.push(userInfo);
        }

        userData.sort((a, b) => b.scrobbles - a.scrobbles);

        // Create pages array
        let pages = [];
        
        for (let i = 0; i < userData.length; ++i) {
            if (i == 50) break;
            if (i % 10 == 0) pages.push('');
            pages[pages.length - 1] += `<:banana_milk:1045928025654575194> **${i + 1}.** **[${userData[i].username}](${userData[i].url})** — **${userData[i].scrobbles}** plays\n`;
        }

        // Create buttons.
        let row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('left')
                .setEmoji('◀️')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('right')
                .setEmoji('▶️')
                .setStyle('SUCCESS')
        )

        // Create and send embed.
        let responseMessage;
        if (pages.length > 1) {
            responseMessage = await msg.channel.send({ 
                embeds: [
                    {
                        title: `Who Knows ${trackArtist} in ${serverName}`,
                        url: trackArtistURL,
                        description: pages[0],
                        footer: { text: `Page [1 / ${pages.length}] | Collective Plays: ${collectivePlays}` },
                        thumbnail: { url: artistImage },
                        color: artistColor.hex
                    }
                ],
                components: [
                    row
                ]
            });
        }
        else {
            responseMessage = await msg.channel.send({ 
                embeds: [
                    {
                        title: `Who Knows ${trackArtist} in ${serverName}`,
                        url: trackArtistURL,
                        description: pages[0],
                        footer: { text: `Page [1 / ${pages.length}] | Collective Plays: ${collectivePlays}` },
                        thumbnail: { url: artistImage },
                        color: artistColor.hex
                    }
                ],
                components: []
            });
        }

        // Create message component collector.
        let filter = (Interaction) => Interaction.user.id == msg.author.id; // for funsies
        let collector = responseMessage.createMessageComponentCollector({ time: 60000 });

        let pageIndex = 0;
        collector.on('collect', i => {
            collector.resetTimer();
            if (i.customId == 'left') {
                --pageIndex;
                if (pageIndex == -1) pageIndex = pages.length - 1;
            } 
            else {
                ++pageIndex;
                if (pageIndex == pages.length) pageIndex = 0;
            }
            i.update({
                embeds: [
                {
                    title: `Who Knows ${trackArtist} in ${serverName}`,
                    url: trackArtistURL,
                    description: pages[pageIndex],
                    footer: { text: `Page [${pageIndex + 1} / ${pages.length}] | Collective Plays: ${collectivePlays}` },
                    thumbnail: { url: artistImage },
                    color: artistColor.hex
                }
                ],
                components: [
                    row
                ]
            });
        });

        collector.on('end', collected => {
            responseMessage.edit({
                embeds: [
                {
                    title: `Who Knows ${trackArtist} in ${serverName}`,
                    url: trackArtistURL,
                    description: pages[pageIndex],
                    footer: { text: `Page [${pageIndex + 1} / ${pages.length}] | Collective Plays: ${collectivePlays}` },
                    thumbnail: { url: artistImage },
                    color: artistColor.hex
                }
                ],
                components: []
            });
        });
    }
}