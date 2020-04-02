require('dotenv').config();
const axios = require('axios');

module.exports = {
    name: 'giphy',
    args: true,
    cooldown: 5,
    discription: 'display giphy image',
    async run(message, args){
        const giphySearch = keyword =>{
            return new Promise((reslove, reject) =>{
                axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_TOKEN}&limit=10&q=${keyword}&lang=en`)
                    .then(res =>{
                        if(res.data){
                            reslove(res.data.data[0].url);
                        }else
                            reject(new Error('Éo tìm thấy'));
                    })
                    .catch(err => reject(err));
            });
        };

        try{
            giphySearch(args)
                .then(url => message.channel.send(url));
        }catch(err){
            message.channel.send(err);
        }
    }
};
