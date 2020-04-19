const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'skip',
    cooldown: 5,
    run(message){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('```Vô room đi con đũy chó```');
        const serverQueue = message.client.queue.get(message.guild.id); 
        if(!serverQueue) return message.channel.send('```Có bào nào đâu ml```');
        serverQueue.connection.dispatcher.end();
        serverQueue.loop = 0;
        const embed = new MessageEmbed().setColor('#03fc66').setTitle(':arrow_forward: :arrow_forward: :arrow_forward: SKIP');        
        return message.channel.send(embed);
    }
};
