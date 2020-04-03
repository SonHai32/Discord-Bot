require('dotenv').config();
const {readdirSync} = require('fs');
const {Collection} = require('discord.js');
const BotClient = require('./struct/Client');

const client = new BotClient({token: process.env.MY_TOKEN, prefix: '!cc'});

client.on('ready', () =>{
    console.log('Bot is running');
});

client.on('message', message =>{
    const commands = readdirSync('./src/commands').filter(file => file.endsWith('.js'));

    for(const file of commands){
        const command = require (`./src/commands/${file}`);

        client.commands.set(command.name, command);
    }
    
    let content = message.content;

    if(content === client.config.prefix) content = `${client.config.prefix} help`; 

    const args = content.slice(client.config.prefix.length+1).split(/ +/);

    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if(!command) return;
    if(command.args && !commandName.length){
        message.channel.send(`${command.name === 'play' ? 'Bài hát đâu ml': command.name === 'giphy' ? 'Tên hình đâu ml' : '' }`);
        return;
    }
    
    if(!client.cooldown.has(command.name)){
        client.cooldown.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamp = client.cooldown.get(command.name);
    const cooldownTime = (command.cooldown || 3 ) * 1000;

    if(timestamp.has(message.author.id)){
        const totalTime = timestamp.get(message.author.id) + cooldownTime;
        if(now < totalTime){
            const timeLeft = (totalTime - now) / 1000; 
            return message.channel.send(`Thử lại sau ${timeLeft.toFixed(1)}s`);
        }
    }

    timestamp.set(message.author.id, now);
    setTimeout(() => timestamp.delete(message.author.id), cooldownTime);

    try{
        command.run(message, args.join(' '));
    }catch(err){
        console.log(err);
        message.channel.send(err);
    }

});

client.login(client.config.token);
