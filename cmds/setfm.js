const { error, lfmGetUser } = require('../functions.js');

module.exports = {
    name: 'SetFM',
    aliases: [ 'setfm' ],
    group: 'setup',
    description: 'Sets your LastFM account.',
    async run(client, msg, db) {
        // build arguments
        let arguments = msg.content.substring(1).split(' ');
        let lastFMUser = arguments[1];

        // if no LastFM provided
        if (!lastFMUser) return error(msg.channel, 'No Username Provided', 'Please enter a Last.FM username');

        // check if LastFM provided is valid.
        let lastFMUserObj = await lfmGetUser(lastFMUser);
        if (!lastFMUserObj) return error(msg.channel, 'Invalid Input', 'Invalid username or nonexistent user!\n<:banana_milk:1045928025654575194> Please connect to Last.FM using `;setfm <last.fm username>`');

        // update DB entry
        await Promise.resolve(db.db('BananaMilk').collection('users').updateOne({ userID: msg.author.id }, { $set: { lastFMUser: lastFMUser } }, { upsert: true }));
        
        // response
        let lastFMProfilePicture = lastFMUserObj.image[3]['#text'];
        return msg.channel.send({ embeds: [
            {
                title: 'Last.FM connection success!',
                description: `Account set to \`${lastFMUser}\``,
                thumbnail: { url: lastFMProfilePicture },
                color: '0x2ecc71'
            }
        ]})
    }
}