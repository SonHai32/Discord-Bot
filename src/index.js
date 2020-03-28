const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');

const MusicController = require('./musicColtroller');


require('dotenv').config();

client.on('ready', () =>{
    console.log('Bot is Running');
});

let listChannel = [];
const getControl = channelId =>{
    if(listChannel.length === 0){
        const msControl = new MusicController();
        listChannel.push({
            id: channelId,
            control: msControl
        });
    }else{
        if(!listChannel.some(channel => {return channel.id === channelId;})){
            const msControl = new MusicController();
            listChannel.push({
                id: channelId,
                control: msControl
            });
        }
    }

    let currentChannel = listChannel.filter(channel => {return channel.id === channelId;});
    return currentChannel[0].control;

};

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

const giphySearch = keyword =>{
    return new Promise((reslove, reject) =>{
        axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&limit=10&q=${keyword}&lang=en`)
            .then(res =>{
                if(res.data){
                    reslove(res.data.data[0].url);
                }else
                    reject(new Error('Éo tìm thấy'));
            })
            .catch(err => reject('Éo tìm thấy'));
    });
};

const displayGiphy = msg =>{
    let args = msg.content.split(' ');
    let keyword;
    if(args.length > 2)
        keyword = args.filter((val, index) =>{
            return index >= 2;
        }).join(' ');
    else
        keyword = msg.content.split(' ')[2];

    giphySearch(keyword)
        .then(giphyUrl => msg.channel.send(giphyUrl))
        .catch(err => msg.channel.send(err));
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

    if(args[0] === '!cc'){
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
                        console.log(getControl(msg.channel.id));
                        play(msg, value, getControl(msg.channel.id));    
                    }else msg.reply('Cho đệ xin cái link hoặc tên bài :))))');  
                }else msg.reply('Vô room đi con đủy chó !!!');
                break;
            case 'pause':
                pause(getControl(msg.channel.id), msg); 
                break;
            case 'resume':
                resume(getControl(msg.channel.id), msg);
                break;
            case 'skip': 
                skip(getControl(msg.channel.id), msg);
                break;
            case 'stop':
                stop(getControl(msg.channel.id), msg);
                break;
            case 'wait':
                msg.reply(`Còn ${getControl(msg.channel.id).getQueue()} bài nha tml*`);
                break;
            case 'giphy':
                displayGiphy(msg);
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
