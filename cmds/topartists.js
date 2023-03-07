const { error, lfmGetUsername, lfmGetUser, lfmGetTop } = require('../functions.js');
const { MessageActionRow, MessageButton, Interaction } = require('discord.js');

module.exports = {
    name: 'Top Artists',
    aliases: [ 'topartists', 'top2' ],
    group: 'top scrobbles',
    description: 'Displays your 10 top artists.',
    async run(client, msg, db) {
        // Acquire Last.FM username and profile.
        let arguments = msg.content.substring(1).split(' ');
        // overall | 7day | 1month | 3month | 6month | 12month
        let period = '7day';
        let time = 'Week';
        if (arguments[1]) {
            time = arguments[1];
            switch(arguments[1]) {
                case 'all':
                    period = 'overall';
                    break;
                case 'month':
                    period = '1month';
                    break;
                case '3month':
                    period = '3month';
                    time = '3 Months';
                    break;
                case '6month':
                    period = '6month';
                    time = '6 Months';
                    break;
                case 'year':
                    period = '12month';
                    break;
                default:
                    period = '7day';
                    time = 'Week';
            }
        }

        let mention = msg.mentions.users.first();
        let user = msg.author;

        if (mention) user = mention;
    
        let lastFMUser = await lfmGetUsername(user.id, db);

        // If user has not set Last.FM.
        if (!lastFMUser) return error(msg.channel, 'No Last.FM Set', 'Please set your Last.FM with `;setfm`');

        let lastFMUserInfo = await lfmGetUser(lastFMUser);
        // console.log(lastFMUserInfo);

        let top = await lfmGetTop(lastFMUser, period, 'artists');
        // console.log(top);

        // Create pages array
        let pages = [];

        for (let i = 0; i < top.length; ++i) {
            if (i == 50) break;
            if (i % 10 == 0) pages.push('');
            let artist = top[i];
            pages[pages.length - 1] += `<:banana_milk:1045928025654575194> **${(i+1)}.** **[${artist.name}](${artist.url})** (**${artist.playcount}** scrobbles)\n`;
        }

        // create buttons
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

        // send recent embed
        let responseMessage = await msg.channel.send({ 
            embeds: [
                {
                    title: `${user.username} - Top Artists (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                    url: lastFMUserInfo.url,
                    description: pages[0],
                    color: '0x2ecc71',
                    thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                    footer: { text: `page [1 / ${pages.length}]`}
                }
            ],
            components: [
                row
            ]
        });

        // create message component collector
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
                        title: `${user.username} - Top Artists (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                        url: lastFMUserInfo.url,
                        description: pages[pageIndex],
                        color: '0x2ecc71',
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                        footer: { text: `page [${pageIndex + 1} / ${pages.length}]`}
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
                        title: `${user.username} - Top Artists (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                        url: lastFMUserInfo.url,
                        description: pages[pageIndex],
                        color: '0x2ecc71',
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                        footer: { text: `page [${pageIndex + 1} / ${pages.length}]`}
                    }
                ],
                components: []
            });
        });

    }
}