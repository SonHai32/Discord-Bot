const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'jump',
    args: true,
    cooldown: 4,
    async run(message, args){
        const channel = message.member.voice;
        if(!channel) return message.channel.send('!!! Vô room đi con đũy chó');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!serverQueue) return message.channel.send('!!! Có gì đâu mà phát ml*');
        if(!Number.parseInt(args)) return message.channel.send('!!! Phát bài số mấy ml*');
        if((serverQueue.songs.length - 1) < args || serverQueue.songs.length === 1 || args <= 0) return message.channel.send(`Có ${serverQueue.songs.length} bài mà m kêu tao phát bài ${args} ăn lol ak !!!`);
        serverQueue.songs = serverQueue.songs.slice(args - 1);
        serverQueue.connection.dispatcher.end();
        const embed = new MessageEmbed().setColor('#03fc66').setTitle(':track_next: :track_next: :track_next: JUMPED');
        return message.channel.send(embed);
    }
};
