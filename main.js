// Dependencies
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client({
    partials: ['CHANNEL', 'MESSAGE', 'GUILD_MEMBER', 'REACTION'],
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']
});
client.commands = new Discord.Collection();

// MongoDB
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:W1zardBot@localhost:27017";

// Commands
const path = require('path');
const commandLocation = fs.readdirSync(path.join(__dirname, 'cmds'));
const commands = [];
for (const file of commandLocation) {
    const command = require(`${path.join(__dirname, 'cmds')}/${file}`);
    commands.push(command);
}

MongoClient.connect(url, { useNewUrlParser : true }, async function(err, db) {
    client.on("messageCreate", async msg => {
        let serverInfo = await Promise.resolve(db.db('BananaMilk').collection('servers').findOne({ serverID: msg.guild.id }));
        if (!serverInfo) serverInfo = { prefix: ';' };
        if (!serverInfo.prefix) serverInfo.prefix = ';';

        let mention = msg.mentions.users.first();
        if (mention == client.user) {
            // return welcome embed
            return msg.channel.send({ embeds: [
                {
                    title: '🍌 Welcome to Banana Milk!',
                    description: `
                        <:banana_milk:1045928025654575194> get started with \`${serverInfo.prefix}setfm\`
                        <:banana_milk:1045928025654575194> for a list of commands, use \`${serverInfo.prefix}help\`
                        <:banana_milk:1045928025654575194> the server's current prefix is \`${serverInfo.prefix}\`
                    `,
                    thumbnail: { url: 'https://cdn.discordapp.com/emojis/856757292074401812.png' },
                    color: '0xc08c3c'
                }
            ]});
        }

        if (!msg.content.startsWith(serverInfo.prefix)) return;

        let arguments = msg.content.substring(serverInfo.prefix.length).split(' ');
        let commandName = arguments[0];

        if (commandName == 'help') {
            let groups = [];
            for (let i = 0; i < commands.length; ++i) {
                if(!groups[commands[i].group]) groups[commands[i].group] = '';
                groups[commands[i].group] += `<:banana_milk:1045928025654575194> \`${serverInfo.prefix}${commands[i].aliases[0]}\` - ${commands[i].description}\n`;
            }
    
            let helpDescription = `__**Setup:**__\n${groups['setup']}
                __**Recent Scrobbles:**__\n${groups['recent scrobbles']}
                __**Top Scrobbles:**__\n${groups['top scrobbles']}
                __**Who Knows:**__\n${groups['who knows']}
                __**Other:**__\n${groups['other']}`;
    
            return msg.channel.send({ embeds: [
                {
                    title: '🛠️ Banana Milk Commands',
                    description: helpDescription,
                    thumbnail: { url: 'https://cdn.discordapp.com/attachments/766710127637823559/1065438849540567091/image0.jpg' },
                    color: '0x0096FF'
                }
            ]});
        }

        // Find command.
        let command = commands.find(x => x.aliases.includes(commandName));

        // If no command, return.
        if (!command) return;

        // Adds user who runs a command to servers table.
        await Promise.resolve(db.db('BananaMilk').collection('servers').updateOne({ serverID: msg.guild.id }, { $addToSet: { users: msg.author.id } }, { upsert: true }));

        // Run command.
        command.run(client, msg, db, arguments);
    });

    client.on('ready', async () => {
        console.log("Banana Milk is now online.");
    });
});

client.login("");