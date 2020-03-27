const Discord = require('discord.js');
const client = new Discord.Client();
//const ytdl = require('ytdl-core');

const MusicController = require('./musicColtroller');
const msControl = new MusicController();

require('dotenv').config();

client.on('ready', () =>{
    console.log('Bot is Running');
});



const play  = async (msg, song, msControl) =>{
    
    const connection = await msg.member.voice.channel.join();
    msControl.setConnection(connection);
    if(msControl.getSongCount() >= 1){
        msControl.setSong(song);
        msg.reply(`Hàng đợi thứ ${msControl.getQueue()}`);
        return;
    }
    
    msControl.setSong(song);
    msControl.play();
};

const skip = (msControl, msg) =>{
    const queue = msControl.getQueue();
    if(queue >= 1){
        msControl.skip();
        return;
    }

    msg.reply('Hết bài rồi thằng ml');
};

const stop = (msControl, msg) =>{
    if(msControl.getDispatcher()) msControl.stop();
    else msg.reply('Có bài nào đâu mà kêu tao dừng, thứ nứng l* -_-'); 
};
const pause = (msControl, msg) =>{
    if(msControl.getDispatcher()) msControl.pause();
    else msg.reply('Có bài nào đâu mà kêu tao dừng, thứ nứng l* -_-'); 
};
const resume = (msControl, msg) =>{
    if(msControl.getDispatcher()) msControl.resume();
    else msg.reply('Có bài nào đâu mà kêu tao dừng, thứ nứng l* -_-'); 
};




client.on('message', async msg =>{
    if(!msg.guild) return;
    const args = msg.content.split(' ');

    if(args[0] === '!ccgang'){
        const command = args[1];
        const value = args[2];
                        
       
        if(command){
            switch(command){
            case 'play':
                if(msg.member.voice.channel){
                    if(value){
                        play(msg, value, msControl);    
                    }else msg.reply('Cho đệ xin cái link hoặc tên bài :))))');  
                }else msg.reply('Vô room đi con đủy chó !!!');
                break;
            case 'pause':
                pause(msControl, msg); 
                break;
            case 'resume':
                resume(msControl, msg);
                break;
            case 'skip': 
                skip(msControl, msg);
                break;
            case 'stop':
                stop(msControl, msg);
                break;
            case 'wait':
                msg.reply(`Còn ${msControl.getQueue()} bài nha tml*`);
                break;
            default: 
                msg.reply('Sai Lệnh Rồi Thằng ml*');
                break;
            }
        }else msg.reply('Sai Lệnh Rồi Thằng ml* ' + msg.member.displayName);
    }
/*
    if(msg.content.includes('!botcc play')){
        if(msg.member.voice.channel){
            const url = msg.content.split(' ')[2];
            if(url.includes('https://')){
                

                const connection = await msg.member.voice.channel.join();
                const msControl = new MusicController(connection, url, msg);
                //connection.play(ytdl(url, { filter: format => format.container === 'mp4' }));
                msControl.play(0);
            }
            
        }else{
            msg.reply('Vào channel đi thằng ml.Bố m biết m ở đâu mà nhảy vào');
        }
    }*/
});

client.login(process.env.MY_TOKEN);
