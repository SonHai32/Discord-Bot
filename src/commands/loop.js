const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'loop',
    cooldown: 5,
    args: true,
    run(message,args){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('``` Vô room đi con đũy !!! ```');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!serverQueue) return message.channel.send('```Có bài nào đâu ml```');
        if(args === 'end'){
            serverQueue.loop = 0;
            return message.channel.send('```Vòng lập kết thúc !!!```');
        }
        if(!Number.parseInt(args)) return message.channel.send('```Số lần lập lại ???```');
        serverQueue.loop = args;
        const embed = new MessageEmbed().setColor('#ff0000').setTitle(`Bài hát : ${serverQueue.songs[0].title} Được lập lại ${args} lần`);
        return message.channel.send(embed);
    }
};
