const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'resume',
    cooldown: 5,
    run(message){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('```Vô room đi con đũy chó```');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(serverQueue && ! serverQueue.playing){
            serverQueue.playing = true;
            if(!serverQueue.connection.dispatcher) return;
            serverQueue.connection.dispatcher.resume();
            const embed = new MessageEmbed().setColor('#03fc66').setTitle(':play_pause: :play_pause: :play_pause: RESUME !');
            return message.channel.send(embed);
        }

        return message.channel.send('```Có gì đâu dừng ml```');
    }
};
