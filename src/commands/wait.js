const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'wait',
    cooldown: 1,
    run(message){
        const {channel} = message.member.voice;
        if(!channel) return message.channel.send('```Vô room đi con đũy chó```');
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!serverQueue) return message.channel.send('```Có bài nào đâu ml```');

        const embed = new MessageEmbed().setColor('#ff0000').setTitle(`:first_quarter_moon_with_face: :first_quarter_moon_with_face: :first_quarter_moon_with_face: Hàng đợi ${serverQueue.playing ? serverQueue.songs.length - 1 : serverQueue.songs.length }`);

        message.channel.send(embed);
    }
};
