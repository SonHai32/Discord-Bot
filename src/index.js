const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');


const MusicController = require('./musicColtroller');
const msControl = new MusicController();

require('dotenv').config();

client.on('ready', () =>{
    console.log('Bot is Running');
});

const getYoutubeVideo = (args) =>{
    if(args.includes('https://')) return args;
    let songName = encodeURI(args);
    return new Promise((reslove, reject) =>{
        axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${songName}&key=${process.env.YT_TOKEN}`)
            .then(res => {
                if(res.data)
                    reslove(`https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`); 
                else
                    reject('Ko tim thay')
            })
            .catch(err => reject(err));   
    }); 
    
};

const play  = async (msg, song, msControl) =>{
    try{
        const url = await getYoutubeVideo(song);
        const connection = await msg.member.voice.channel.join();
        msControl.setConnection(connection);
        if(msControl.getSongCount() >= 1){
            msg.reply(url);
            msControl.setSong(url);
            msg.reply(`Hàng đợi thứ ${msControl.getQueue()}`);
            return;
        }
        
        msg.reply(url);
        msControl.setSong(url);
        msControl.play();

    }catch(err){
            
        msg.reply('Éo kiếm ra được m ơi :(( ');


        msg.reply(err.message);
    }
    /* 
    
        */
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
    let args = msg.content.split(' ');

    if(args[0] === '!ccgang'){
        const command = args[1];
        let value;
        
        if(args.length > 2){
            value = args.filter((val, index) =>{
                return index >= 2;
            });
            value = value.join(' ');
        }else value = args[2];

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
