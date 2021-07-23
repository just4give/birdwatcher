const TelegramBot = require('telegram-bot-api'); 
const axios = require('axios');
const fs = require('fs');

const TG_TOKEN =  process.env.TG_TOKEN ; 
const TG_CHAT_ID = process.env.TG_CHAT_ID ;
const bot = new TelegramBot({token: TG_TOKEN}); 

const express = require('express');
const bodyParser = require('body-parser')
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.post('/send/audio', async (req, res)=>{
    console.log("send audio ", req.body);
    await bot.sendAudio({
                    chat_id: TG_CHAT_ID,
                    caption: `${req.title}`,
                    audio: fs.createReadStream(`/var/media/${body.filename}`)
                })
    res.json({success: true});

});

app.post('/send/image', async (req, res)=>{
    console.log("send image ", req.body);
    
    await bot.sendPhoto({
        chat_id: TG_CHAT_ID,
        caption: `${req.title}`,
        photo: fs.createReadStream(`/var/media/${body.filename}`)
    })
    res.json({success: true});

});

app.listen(3000,()=>{
    console.log("Telegram block started ");
})