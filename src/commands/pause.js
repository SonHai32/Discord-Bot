const {MessageEmbed} = require('discord.js');
module.exports = {
    name: 'pause',
    cooldown: 5,
    run(message){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('Vô room đi con đũy chó');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(serverQueue && serverQueue.playing){
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();

            const embed = new MessageEmbed().setColor('#03fc66').setTitle(':pause_button: :pause_button: :pause_button:  PAUSE !');
            return message.channel.send(embed);
        }
        
        return message.channel.send('Có gì đâu mà dừng ml');
    }
};
