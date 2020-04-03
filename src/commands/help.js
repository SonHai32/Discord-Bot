const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'help',
    cooldown: 1,
    description: 'Show help commands menu',
    run(message){
        const embed  = new MessageEmbed()
            .setColor('#00ffff')
            .setTitle(':x: :x: :x: CC Discord Bot Help Menu :x: :x: :x: ')
            .setAuthor('Developer: Sơn Hải', 'https://cdn.discordapp.com/avatars/339570758441369602/30fecc3bc07119757bc25d1240feece7.png?size=256', 'https://www.facebook.com/hai.lam.3726613/')
            .setDescription('Discord bot developed by SonHai')
            .addFields(
                {name: 'play /song name or youtube link/ ', value: 'Play music ex: play Snoopdog...'},
                {name: 'skip', value: 'skip next song'},
                {name: 'pause', value: 'pause song'},
                {name: 'resume', value: 'resume song'},
                {name: 'stop', value: 'stop song and clear all queue'},
                {name: 'jump /queue number/', value: 'jump to song in queue, ex: jump 20 : jump to song 20 in queue'},
                {name: 'wait', value: 'show total song in queue'},
                {name: 'help', value: 'show help menu'}
            )
            .setTimestamp()
            .setFooter('https://github.com/SonHai32/Discord-Bot','https://avatars2.githubusercontent.com/u/48214325?s=60&v=4');

        message.channel.send(embed);

    }
};
