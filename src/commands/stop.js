const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'stop',
    cooldown: 5,
    run(message){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('```Vô room đi con đũy```');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!serverQueue) return message.channel.send('```Có bài nào đâu dừng cha```');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Stop');

        const embed = new MessageEmbed().setColor('#03fc66').setTitle(':stop_button: :stop_button: :stop_button: STOP !');
        return message.channel.send(embed);
    }
};
