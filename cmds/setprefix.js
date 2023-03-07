const { error, lfmGetUser } = require('../functions.js');

module.exports = {
    name: 'SetPrefix',
    aliases: [ 'setprefix' ],
    group: 'setup',
    description: 'Sets your server\'s prefix. (Admin Command)',
    async run(client, msg, db) {
        let hasPermission = msg.member.permissions.has('ADMINISTRATOR');
        if (!hasPermission) return error(msg.channel, 'Permission Denied', 'You do not have permission to access this command');
        
        // build arguments
        let arguments = msg.content.substring(1).split(' ');
        let prefix = arguments[1];

        // if no preifx provided
        if (!prefix) return error(msg.channel, 'No Prefix Provided', 'Please enter a prefix');

        // update DB entry
        await Promise.resolve(db.db('BananaMilk').collection('servers').updateOne({ serverID: msg.guild.id }, { $set: { prefix: prefix } }, { upsert: true }));
        
        // response
        let serverPicture = await msg.guild.iconURL();
        return msg.channel.send({ embeds: [
            {
                title: `prefix update success!`,
                description: `<:banana_milk:1045928025654575194> prefix set to \'${prefix}\'`,
                thumbnail: { url: serverPicture },
                color: '0x2ecc71'
            }
        ]})
    }
}