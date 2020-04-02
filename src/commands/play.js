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

        if(!channel) return message.channel.send('Vô room đi con đũy');

        const permission = channel.permissionsFor(message.client.user);
        
        if(!permission.has('CONNECT')) return message.channel.send('Không có quyền sao vô đc ba -_- !!!');
        if(!permission.has('SPEAK')) return message.channel.send('Room cấm nói chuyện kêu t vô hát ăn c* à ml');



        const getYoutubeSong =(args) =>{
            return new Promise((reslove, reject) =>{
                if(args.includes('https')){
                    if(args.includes('list')){
                        return youtube.getPlaylist(args).then(val => {
                            val.getVideos()
                                .then(videos => reslove(videos))
                                .catch(err => reject(err));
                        }).catch(err => reject(err));
                    }
                    
		}
                youtube.searchVideos(args).then(val =>{
                    reslove({
                        id: val[0].id,
                        title: val[0].title,
                        url: `https://www.youtube.com/watch?v=${val[0].id}`
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
                        url: `https://www.youtube.com/watch?v=${song.id}`
                    });
                }
            }else serverQueue.songs.push(songList);
            return message.channel.send(`${songList.length > 0 ? `Playlist: ${songList[0].title}` : songList.title }  \n đã được thêm vào${serverQueue.playing? `, hàng đợi ${serverQueue.songs.length - 1}` : ` hàng đợi ${serverQueue.songs.length}`}`);
        }

        const queueConstruct = {
            connection: null,
            textChannel: message.channel,
            voiceChannel: channel,
            songs: [],
            playing: true
        };

        message.client.queue.set(message.guild.id, queueConstruct);
        serverQueue = message.client.queue.get(message.guild.id);
       

        if(songList.length > 0){
            for(const song of songList){
                serverQueue.songs.push({
                    id: song.id,
                    title: song.title,
                    url: `https://www.youtube.com/watch?v=${song.id}`
                });
            }
        }else serverQueue.songs.push(songList);
        
        const totalSong = serverQueue.songs.length;

        message.channel.send(`${totalSong > 0 ? `Playlist: ${serverQueue.songs[0].title}` : serverQueue.songs.title }  \n đã được thêm vào${serverQueue.playing? `, hàng đợi ${totalSong - 1}` : ` hàng đợi ${totalSong}`}`);
        const play = async song =>{
            const queue = message.client.queue.get(message.guild.id);

            if(!song){
                queue.voiceChannel.leave();
                message.client.queue.delete(message.guild.id);
                return;
            }

            const dispatcher = queue.connection.play(await ytdl(song.url, {filter: 'audioonly',quality: 'highestaudio',highWaterMark: 1024 * 1024 * 10}));
            
            dispatcher
                .on('finish', () =>{
                    queue.songs.shift();
                    play(queue.songs[0]);
                })
                .on('error', err => console.error(err));

            const embed = new MessageEmbed().setColor('#ff00c8').setTitle(`:play_pause: :play_pause: :play_pause:  ***PLAY***  :poop: ${song.title} :poop:`);
            queue.textChannel.send(embed);
            queue.textChannel.send(song.url);
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
