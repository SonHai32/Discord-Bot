'use strict';
const ytdl = require('ytdl-core-discord');

module.exports =  class MusicController{
    constructor(){
        this.connection = {};
        this.songs = {
            queue: 0,
            list: []
        };
        this.dispatcher = null;
    }

    setSong(song){
        
        let queue = this.songs.queue;
        this.songs.queue = (this.songs.list.length >= 1 ? queue + 1 : 0);
        this.songs.list.push(song);
    }
    setConnection(connection){
        this.connection = connection;
    }

    getQueue(){
        return this.songs.queue;
    }

    getSongCount(){
        return this.songs.list.length;
    }

    getDispatcher(){
        return this.dispatcher;
    }
   

    async play(){
        if(this.songs.list.length > 0){
            let songs = this.songs;
            this.dispatcher = this.connection.play( await ytdl(songs.list[0],{filter: 'audioonly'}), {type: 'opus'});

            this.dispatcher.on('finish', () =>{
                this.songs.list.shift();
                this.songs.queue--;
                if(this.songs.list[0]){
                    this.play();
                }else
                    this.dispatcher.destroy();
            });
        }else{
            this.dispatcher.destroy();
            this.dispatcher = null;
            return;
        }
    }
  
    skip(){
        if(this.songs.queue === 0) return;
            
        this.songs.list.shift();
        this.songs.queue--;
        this.play();
    }

    pause(){
        this.dispatcher.pause();
    }

    resume(){
        this.dispatcher.resume();
    }

    stop(){
        this.songs.list = [];
        this.songs.queue = 0;
        this.dispatcher.destroy();
        this.dispatcher = null;
    }


};


