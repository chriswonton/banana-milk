const { error, lfmGetUsername, lfmGetUser, lfmGetTop } = require('../functions.js');
const { MessageActionRow, MessageButton, Interaction } = require('discord.js');

module.exports = {
    name: 'Top',
    aliases: [ 'top' ],
    group: 'top scrobbles',
    description: 'Displays your 10 top tracks, artists, and albums.',
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

        let top = await lfmGetTop(lastFMUser, period, 'tracks');
        let topDescription = '';

        for (let i = 0; i < top.length; ++i) {
            if (i == 10) break;
            let track = top[i];
            topDescription += `<:banana_milk:1045928025654575194> **${(i+1)}.** **[${track.name}](${track.url})** by **${track.artist.name}** (**${track.playcount}** scrobbles)\n`;
        }

        // create buttons
        let row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('tracks')
                .setEmoji('🎵')
                .setLabel('Tracks')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('artists')
                .setEmoji('👩‍🎨')
                .setLabel('Artists')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('albums')
                .setEmoji('💽')
                .setLabel('Albums')
                .setStyle('DANGER')
        )

        // send recent embed
        let responseMessage = await msg.channel.send({ 
            embeds: [
                {
                    title: `${user.username} - Top Tracks (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                    url: lastFMUserInfo.url,
                    description: topDescription,
                    color: '0x2ecc71',
                    thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                }
            ],
            components: [
                row
            ]
        });

        

        // create message component collector
        let filter = (Interaction) => Interaction.user.id == msg.author.id; // for funsies
        let collector = responseMessage.createMessageComponentCollector({ time: 60000 });

        let colors = [];
        let type = '';

        let pageIndex = 'tracks';
        collector.on('collect', async i => {
            collector.resetTimer();
            if (i.customId == pageIndex) return i.reply({ content: 'You\'re already on this page!', ephemeral: true });
            pageIndex = i.customId;
            top = await lfmGetTop(lastFMUser, period, i.customId);
            topDescription = '';

            for (let j = 0; j < top.length; ++j) {
                if (j == 10) break;
                let data = top[j];
                if (i.customId == 'tracks') topDescription += `<:banana_milk:1045928025654575194> **${(j+1)}.** **[${data.name}](${data.url})** by **${data.artist.name}** (**${data.playcount}** scrobbles)\n`;
                if (i.customId == 'artists') topDescription += `<:banana_milk:1045928025654575194> **${(j+1)}.** **[${data.name}](${data.url})** (**${data.playcount}** scrobbles)\n`;
                if (i.customId == 'albums') topDescription += `<:banana_milk:1045928025654575194> **${(j+1)}.** **[${data.name}](${data.url})** by **${data.artist.name}** (**${data.playcount}** scrobbles)\n`;
            }
            
            // Create button colors.
            colors['tracks'] = { buttonColor: 'PRIMARY', embedColor: '0x0096FF'};
            colors['artists'] = { buttonColor: 'SUCCESS', embedColor: '0x2ecc71'};
            colors['albums'] = { buttonColor: 'DANGER', embedColor: '0xff0000'};
            colors[i.customId].buttonColor = 'SECONDARY';

            // Create buttons.
            row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('tracks')
                    .setEmoji('🎵')
                    .setLabel('Tracks')
                    .setStyle(colors['tracks'].buttonColor),
                new MessageButton()
                    .setCustomId('artists')
                    .setEmoji('👩‍🎨')
                    .setLabel('Artists')
                    .setStyle(colors['artists'].buttonColor),
                new MessageButton()
                    .setCustomId('albums')
                    .setEmoji('💽')
                    .setLabel('Albums')
                    .setStyle(colors['albums'].buttonColor)
            )
            
            // send recent embed
            type = `${i.customId[0].toUpperCase() + i.customId.slice(1)}`
            i.update({ 
                embeds: [
                    {
                        title: `${user.username} - Top ${type} (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                        url: lastFMUserInfo.url,
                        description: topDescription,
                        color: colors[type.toLowerCase()].embedColor,
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
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
                        title: `${user.username} - Top ${type} (${time[0].toUpperCase() + time.slice(1).toLowerCase()})`,
                        url: lastFMUserInfo.url,
                        description: topDescription,
                        color: colors[type.toLowerCase()].embedColor,
                        thumbnail: { url: lastFMUserInfo.image[3]['#text'] },
                    }
                ],
                components: []
            });
        });

    }
}