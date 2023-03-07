const { error, lfmGetUsername, lfmGetRecent, lfmGetUser } = require('../functions.js');
const { MessageActionRow, MessageButton, Interaction } = require('discord.js');

module.exports = {
    name: 'Recent',
    aliases: [ 'recent' ],
    group: 'recent scrobbles',
    description: 'Displays your 10 most recent songs.',
    async run(client, msg, db) {
        // Acquire Last.FM username and profile.
        let mention = msg.mentions.users.first();
        let user = msg.author;

        if (mention) user = mention;
    
        let lastFMUser = await lfmGetUsername(user.id, db);

        // If user has not set Last.FM.
        if (!lastFMUser) return error(msg.channel, 'No Last.FM Set', 'Please set your Last.FM with `;setfm`');
        let lastFMUserInfo = await lfmGetUser(lastFMUser);
        // console.log(lastFMUserInfo);

        let recent = await lfmGetRecent(lastFMUser);
        // console.log(recent)

        // Create pages array.
        let pages = [];

        for (let i = 0; i < recent.length; ++i) {
            if (i == 50) break;
            if (i % 10 == 0) pages.push('');
            let track = recent[i];
            pages[pages.length - 1] += `<:banana_milk:1045928025654575194> **${(i+1)}.** **[${track.name}](${track.url})** by **${track.artist['#text']}**\n`;
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
        let responseMessage = await msg.channel.send({ 
            embeds: [
                {
                    title: `${user.username} - Recent`,
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
                        title: `${user.username} - Recent`,
                        url: lastFMUserInfo.url,
                        description: pages[pageIndex],
                        color: '0x2ecc71',
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                        footer: { text: `Page [${pageIndex + 1} / ${pages.length}]`}
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
                        title: `${user.username} - Recent`,
                        url: lastFMUserInfo.url,
                        description: pages[pageIndex],
                        color: '0x2ecc71',
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                        footer: { text: `Page [${pageIndex + 1} / ${pages.length}]`}
                    }
                ],
                components: []
            });
        });
    }
}