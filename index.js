const { Client, GatewayIntentBits } = require('discord.js');
var ping = require('ping');
var net = require('net');
require('dotenv').config();
const config = require('./config');
const { EmbedBuilder } = require('@discordjs/builders');


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

console.log(config)

const TOKEN = config.token;

const CHANNEL = config.channel;
var hosts = config.hosts;

var previousStates = {};

async function ifdead(target, status){
    await ping.sys.probe(target.host, function (isAlive) {
        var msg = isAlive ? status + "\n" + 'but ... host: ' + target.host + ' server is alive' : 'and ... host: ' + target.host + ' server dead';
        sendMessageToDiscord(target.titlesOnDown, target.messageOnDown + "\n" + msg, target.messageDomain, "DOWN");
    })
}
function checkHosts(){
    hosts.forEach(function(target){
        var socket = new net.Socket();
        socket.setTimeout(1500);
        console.log(target)
        socket.on('connect', function() {
            var currentState = 'alive';
            if (previousStates[target.host] !== currentState) {
                msg = 'UP: host ' + target.host + ' on port ' + target.port + ' is alive';

                previousStates[target.host] = currentState;
                sendMessageToDiscord(target.titlesOnUP, target.messageOnUP, target.messageDomain, 'UP');
            }
            socket.destroy(); // 接続を閉じる
        }).on('error', function() {
            var currentState = 'dead';
            if (previousStates[target.host] !== currentState) {
                msg = 'DOWN: host ' + target.host + ' on port ' + target.port + ' is dead (error)';
                previousStates[target.host] = currentState;
                ifdead(target, msg);
            }
        }).on('timeout', function() {
            var currentState = 'dead';
            if (previousStates[target.host] !== currentState) {
                msg = 'DOWN: host ' + target.host + ' on port ' + target.port + ' is dead (timeout)';
                previousStates[target.host] = currentState;
                ifdead(target , msg);
            }
            socket.destroy(); // タイムアウト時に接続を閉じる
        }).connect(target.port, target.host);
    });
}



async function sendMessageToDiscord(title, message, domain, status) {
    const channel = client.channels.cache.get(CHANNEL);
    const { EmbedBuilder } = require('@discordjs/builders');
    if (channel) {
        const embedtext = new EmbedBuilder()
        .setColor(status === 'DOWN' ? 0x7d1212 : 0x127d47)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: domain });
        setTimeout(async () => {
            await channel.send({embeds: [embedtext]});
        },5000);
    } else {
        console.log('channel not found');
    }
}

client.on("messageCreate", async message => {
    if (message.content === '!settings') {
        console.log(config)
    }
})

let interval = 10;
setInterval(checkHosts, interval * 1000);
client.login(TOKEN).catch(console.error);