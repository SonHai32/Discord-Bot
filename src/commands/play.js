require('dotenv').config();
const axios = require('axios').default
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
        const {channel} = await message.member.voice;

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
                let song = args;
                if(args.includes('https')){
                    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi ;
                    song = args.split(youtubeIdRegex)[1];
                    if(!song) return reject(new Error('Not Found'));
                    
                    youtube.getVideoByID(song).then(val =>{
                        if(val) reslove({
                            id: val.id,
                            title: val.title,
                            url: `https://www.youtube.com/watch?v=${val.id}`,
                            image: val.thumbnails.high.url,
                            description: val.description
                        });
                        else reject(new Error('Not Found'))
                    }).catch(err => reject(err));
                    
                }
                
                axios.get(`https://youtube.googleapis.com/youtube/v3/search?q=start&key=${process.env.YT_TOKEN}`, {headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.YT_TOKEN}`
                } }).then((val) =>{
                    console.log(val);
                })
                youtube.searchVideos(song).then(val =>{
                    if(val) reslove({
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
        await getYoutubeSong(args).then(songs => songList = songs).catch( async err => {
            const notfoundMessage = new MessageEmbed().setColor('#00ffff').setTitle('!!!ERROR : NOT FOUND ').setDescription(err.message);
            return await message.channel.send(notfoundMessage);
        });
        if(!songList) return;

        let serverQueue = await message.client.queue.get(message.guild.id);
        
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
                const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Playlist : ${songList[0].title}\nĐã được thêm vào`);

                const queueEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.songs.length - 1}`);

                await message.channel.send(songAddedEmbed);
                return await message.channel.send(queueEmbed);
            }else {
                serverQueue.songs.push(songList);
                const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Bài Hát : ${songList.title}\nĐã được thêm vào`);
             
                const queueEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.songs.length - 1}`);

                await message.channel.send(songAddedEmbed);
                return message.channel.send(queueEmbed);
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
            const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Playlist : ${songList[0].title}\nĐã được thêm vào`);
            const queueEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:twisted_rightwards_arrows: :twisted_rightwards_arrows: :twisted_rightwards_arrows:  Hàng đợi : ${serverQueue.songs.length - 1}`);
            await message.channel.send(songAddedEmbed);
            await message.channel.send(queueEmbed);
        }else{
            serverQueue.songs.push(songList);
            const songAddedEmbed = new MessageEmbed().setColor('#00ffff').setTitle(`:musical_note: :musical_note: :musical_note:  Bài Hát : ${songList.title}\nĐã được thêm vào`);
            await message.channel.send(songAddedEmbed);
        }
        

        const play = async song =>{
            const queue = message.client.queue.get(message.guild.id);

            if(!song){
                await queue.voiceChannel.leave();
                await message.client.queue.delete(message.guild.id);
                return;
            }

            const dispatcher = queue.connection.play(await ytdl(song.url, {filter: 'audioonly',quality: 'highestaudio',highWaterMark: 1024 * 1024 * 10}));
            /*
            queue.connection.on('disconnect', async()=> {
                console.log()
            }); 
            */
            dispatcher
                .on('finish', async () =>{
                    if(queue.loop > 0){
                        await play(queue.songs[0]);
                        queue.loop--;
                    }else{
                        await queue.songs.shift();
                        play(queue.songs[0]);
                    }
                })
                .on('error', async err => {
           
                    await message.client.queue.delete(message.guild.id);
                    await channel.leave();

                    const errorEmbed = new MessageEmbed().setColor('#ff0000').setTitle('!!! ERROR !!!').setDescription(`${err.message} \nPlease contact Developer`);
                    await message.channel.send(errorEmbed);
                });

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
            await play(queueConstruct.songs[0]);


        }catch(err){
            message.client.queue.delete(message.guild.id);
            await channel.leave();
            const errorEmbed = new MessageEmbed().setColor('#ff0000').setTitle('!!! ERROR !!!').setDescription(`${err.message} \nPlease contact Developer`);
            await message.channel.send(errorEmbed);
        }

    }
};
