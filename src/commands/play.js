require('dotenv').config();
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const youtube = new Youtube(process.env.YT_TOKEN);

module.exports = {
    name: 'play',
    usage: 'play "youtube song"',
    cooldown: 5,
    args: true,
    async run(message, args){
        const {channel} = message.member.voice;

        if(!channel) return message.channel.send('```Vô room đi con đũy```');

        const permission = channel.permissionsFor(message.client.user);
        
        if(!permission.has('CONNECT')) return message.channel.send('```Không có quyền sao vô đc ba -_- !!!```');
        if(!permission.has('SPEAK')) return message.channel.send('```Room cấm nói chuyện kêu t vô hát ăn c* à ml```');
        const searchingEmbed = new MessageEmbed().setColor('#00ff7b').setTitle(`:mag_right: :mag_right: :mag_right: ĐANG TÌM *** ${args.includes('https') ? args : args.toUpperCase() } ***`);
        await message.channel.send(searchingEmbed);

        const getYoutubeSong =(args) =>{
            return new Promise((reslove, reject) =>{
                if(args.includes('https') && args.includes('list')){
                    return youtube.getPlaylist(args).then(val => {
                        val.getVideos()
                            .then(videos => reslove(videos))
                            .catch(err => reject(err));
                    }).catch(err => reject(err));
                }
                youtube.searchVideos(args).then(val =>{
                    reslove({
                        id: val[0].id,
                        title: val[0].title,
                        url: `https://www.youtube.com/watch?v=${val[0].id}`,
                        image: val[0].thumbnails.high.url,
                        description: val[0].description
                    });
                }).catch(err => reject(err));
            });
        };
        let songList;
        await getYoutubeSong(args).then(songs => songList = songs).catch(err => console.log(err));

        let serverQueue = message.client.queue.get(message.guild.id);
        
        if(serverQueue){
            if(songList.length > 0){
                for(const song of songList){
                    serverQueue.songs.push({
                        id: song.id,
                        title: song.title,
                        url: `https://www.youtube.com/watch?v=${song.id}`,
                        image: song.thumbnails.high.url,
                        description: song.description
                    });
                }
                const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Playlist : ${songList[0].title}\nĐã được thêm vào \n:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.songs.playing ? serverQueue.songs.length - 1 : serverQueue.songs.length }`);
                return await message.channel.send(songAddedEmbed);
            }else {
                serverQueue.songs.push(songList);
                const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Bài Hát : ${songList.title}\nĐã được thêm vào \n:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.playing ? serverQueue.songs.length - 1: serverQueue.songs.length}`);
                return await message.channel.send(songAddedEmbed);
            }
        }

        const queueConstruct = {
            connection: null,
            textChannel: message.channel,
            voiceChannel: channel,
            songs: [],
            playing: true,
            loop: 0
        };

        message.client.queue.set(message.guild.id, queueConstruct);
        serverQueue = message.client.queue.get(message.guild.id);
       

        if(songList.length > 0){
            for(const song of songList){
                serverQueue.songs.push({
                    id: song.id,
                    title: song.title,
                    url: `https://www.youtube.com/watch?v=${song.id}`,
                    image: song.thumbnails.high.url,
                    description: song.description
                });
            }
            const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Playlist : ${songList[0].title}\nĐã được thêm vào \n:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.songs.length}`);
            await message.channel.send(songAddedEmbed);
        }else{
            serverQueue.songs.push(songList);
            const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Bài Hát : ${songList.title}\nĐã được thêm vào`);
            await message.channel.send(songAddedEmbed);
        }
        

        const play = async song =>{
            const queue = message.client.queue.get(message.guild.id);

            if(!song){
                queue.voiceChannel.leave();
                message.client.queue.delete(message.guild.id);
                return;
            }

            const dispatcher = queue.connection.play(await ytdl(song.url, {filter: 'audioonly',quality: 'highestaudio',highWaterMark: 1024 * 1024 * 10}));
            queue.connection.on('disconnect', ()=> {
                return message.client.queue = new Map(); 
            }); 

            dispatcher
                .on('finish', () =>{
                    if(queue.loop > 0){
                        play(queue.songs[0]);
                        queue.loop--;
                    }else{
                        queue.songs.shift();
                        play(queue.songs[0]);
                    }
                })
                .on('error', err => console.error(err));

            const playEmbed = new MessageEmbed().setColor('#ff00c8').setTitle(`:play_pause: :play_pause: :play_pause:  ***>>>PLAYING<<<***  :poop: ${song.title} :poop:`);
            const description = `${song.description.length > 300 ? song.description.slice(0,300) + '\n...' : song.description }`;
            const songInfoEmbed = new MessageEmbed().setColor('#ff0000').setTitle(song.title).setURL(song.url)
                .setThumbnail(song.image).setDescription(description);
            await queue.textChannel.send(songInfoEmbed);
            await queue.textChannel.send(playEmbed);
        };
    

        try{
            const connection = await channel.join();
            queueConstruct.connection = connection;
            play(queueConstruct.songs[0]);


        }catch(err){
            console.error(err);

            message.client.queue.delete(message.guild.id);
            await channel.leave();
            message.channel.send(`Lỗi rồi: ${err}`);
        }

    }
};
