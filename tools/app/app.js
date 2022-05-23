const TelegramBot = require('telegram-bot-api'); 
const { getSdk } = require('balena-sdk');
const axios = require('axios');
const fs = require('fs');
const eisdk = require('./ei_sdk');

const TG_TOKEN =  process.env.TG_TOKEN ||''; 
const TG_CHAT_ID = process.env.TG_CHAT_ID ||'';
let bot; 
const ENABLE_MOTION = process.env.ENABLE_MOTION ||'';
const EI_API_KEY_IMAGE = process.env.EI_API_KEY_IMAGE ||'';
const LATITUDE = process.env.LATITUDE ||'';
const LONGITUDE = process.env.LONGITUDE ||'';
const AUTH_TOKEN = process.env.AUTH_TOKEN||''; // FLEET VARIABLE
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const BALENA_API_KEY = process.env.BALENA_API_KEY;


const express = require('express');
const bodyParser = require('body-parser')
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.post('/send/audio', async (req, res)=>{
    console.log("send audio ", req.body);

    try {
        await bot.sendAudio({
            chat_id: TG_CHAT_ID,
            caption: `${req.title}`,
            audio: fs.createReadStream(`/var/media/${body.filename}`)
        })
    } catch (error) {
        console.log(error);
    }
    
    res.json({success: true});

});

app.post('/send/image', async (req, res)=>{
    console.log("send image ", req.body);

    try {
        await bot.sendPhoto({
            chat_id: TG_CHAT_ID,
            caption: `${req.body.title}`,
            photo: fs.createReadStream(`/var/media/${req.body.filename}`)
        })
    } catch (error) {
        console.log(error);
    }
    
    res.json({success: true});

});

app.post('/ingest', async (req, res)=>{
    console.log("ingest image ", req.body);

    try {
        await eisdk.ingest({
            filename: `/var/media/${req.body.filename}`
        });
    } catch (error) {
        console.log(error);
    }
    
    res.json({success: true});

});

// SETTINGS endpoints

app.get('/settings/update-ei-keys', async (req, res)=>{

    res.json({success: true, "EI_API_KEY_IMAGE":EI_API_KEY_IMAGE});
});

app.post('/settings/update-ei-keys', async (req, res)=>{
    console.log("Update EI credentials ", req.body);

	try {

        if (req.body.tg_chat_id != TG_CHAT_ID)
        {
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "EI_API_KEY_IMAGE",
                req.body.ei_api_key
            );
            console.log("EI KEY updated!");
        }

	} catch (error) {
		console.log("error", error);
	}

    //res.json({success: true});
    res.sendStatus(200);

});

app.get('/settings/update-telegram-keys', async (req, res)=>{

    res.json({success: true, "TG_TOKEN":TG_TOKEN, "TG_CHAT_ID":TG_CHAT_ID});
});

app.post('/settings/update-telegram-keys', async (req, res)=>{
    console.log("Update Telegram credentials ", req.body);

	try {

        if (req.body.tg_chat_id != TG_CHAT_ID){
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "TG_CHAT_ID",
                req.body.tg_chat_id
            );
            console.log("TG_CHAT updated!");
        }
		
        if (req.body.tg_token != TG_TOKEN){
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "TG_TOKEN",
                req.body.tg_token
            );
            console.log("TG_TOKEN updated!");
        }

	} catch (error) {
		console.log("error", error);
	}

    //res.json({success: true});
    res.sendStatus(200);

});

app.get('/settings/update-credentials', async (req, res)=>{

    res.json({success: true, "USERNAME":USERNAME, "PASSWORD":PASSWORD});
});

app.post('/settings/update-credentials', async (req, res)=>{
    console.log("Update credentials ", req.body);

	try {

        if (req.body.user != USERNAME){
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "USERNAME",
                req.body.user
            );
            console.log("Username updated!");
        }
		
        if (req.body.pass != PASSWORD){
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "PASSWORD",
                req.body.pass
            );
            console.log("Password updated!");
        }

	} catch (error) {
		console.log("error", error);
	}

    //res.json({success: true});
    res.sendStatus(200);

});


app.get('/settings/update-geo', async (req, res)=>{

    res.json({success: true, "LATITUDE":LATITUDE, "LONGITUDE":LONGITUDE});
});

app.post('/settings/update-geo', async (req, res)=>{
    console.log("Update Geoposition ", req.body);

	try {

        if (req.body.lat != LATITUDE){
            await sdk.models.device.tags.set(
                process.env.BALENA_DEVICE_UUID,
                "LATITUDE",
                req.body.lat
            );
            console.log("LAT updated!");
        }
		
        if (req.body.lon != LONGITUDE){
            await sdk.models.device.tags.set(
                process.env.BALENA_DEVICE_UUID,
                "LONGITUDE",
                req.body.lon
            );
            console.log("LON updated!");
        }

	} catch (error) {
		console.log("error", error);
	}

    //res.json({success: true});
    res.sendStatus(200);

});


app.get('/settings/update-motion', async (req, res)=>{

    res.json({success: true, "MOTION":ENABLE_MOTION});
});

app.post('/settings/update-motion', async (req, res)=>{
    console.log("Update Motion ", req.body);

	try {
        if (req.body.motion != ENABLE_MOTION){
            await sdk.models.device.envVar.set(
                process.env.BALENA_DEVICE_UUID,
                "ENABLE_MOTION",
                req.body.motion
            );
            console.log("MOTION updated!");
        }

	} catch (error) {
		console.log("error", error);
	}

    //res.json({success: true});
    res.sendStatus(200);

});




app.listen(3000, async(req, res)=>{
    console.log("Tools block started ");
    try{

        bot = new TelegramBot({token: TG_TOKEN});
        sdk = getSdk({
            // only required if the device is not running on balena-cloud.com
            apiUrl: process.env.BALENA_API_URL
        });
    
      
        await sdk.auth.logout();
        await sdk.auth.loginWithToken(process.env.BALENA_API_KEY);
        console.log("Login successful!")
        //await sdk.models.device.tags.set(process.env.BALENA_DEVICE_UUID, 'stats.last_server_start', Date.now());
      } catch (err) {
        console.log(err);
        console.error('Error while setting stats.last_server_start tag', err);
      }

})