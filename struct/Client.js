const {Collection, Client} = require('discord.js');

module.exports = class extends Client{
    constructor(config){
        super({
            disableMention: 'everyone'
        });

        this.commands = new Collection();

        this.cooldown = new Collection();
        
        this.queue = new Map();

        this.config = config;

    }

};
