const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

require('dotenv').config();

client.on('ready', () =>{
    console.log('hwllo');
});

client.on('message', async msg =>{
    if(!msg.guild) return;
    if(msg.content === '!botsh play'){
        if(msg.member.voice.channel){
            const connection = await msg.member.voice.channel.join();
            connection.play(ytdl('https://www.youtube.com/watch?v=kjYW63CVbsE', { filter: format => format.container === 'mp4' }));
        }else{
            msg.reply('Vào channel đi thằng ml.Bố m biết m ở đâu mà nhảy vào');
        }
    }
});

client.login(process.env.MY_TOKEN);

