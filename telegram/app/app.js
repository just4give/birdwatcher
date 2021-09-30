const TelegramBot = require('telegram-bot-api'); 
const SdkInstanceFactory = require("balena-sdk");
const axios = require('axios');
const fs = require('fs');
const eisdk = require('./ei_sdk');

const TG_TOKEN =  process.env.TG_TOKEN ||''; 
const TG_CHAT_ID = process.env.TG_CHAT_ID ||'';
const bot = new TelegramBot({token: TG_TOKEN}); 

const EI_API_KEY_IMAGE = process.env.EI_API_KEY_IMAGE ||'';
const LATITUDE = process.env.LATITUDE ||'';
const LONGITUDE = process.env.LONGITUDE ||'';

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
    
    sdk = SdkInstanceFactory();
	//sdk.auth.logout();
	//sdk.auth.loginWithToken(process.env.BALENA_API_KEY);

    let accountKey = "";
	try {
		const [{ id: serviceId }] = await sdk.models.service.getAllByApplication(
			Number(process.env.BALENA_APP_ID),
			{
				$select: "id",
				$filter: { service_name: "ei-processing" },
			}
		);
		await sdk.models.device.serviceVar.set(
			process.env.BALENA_DEVICE_UUID,
			serviceId,
			"EI_API_KEY_IMAGE",
			req.body.ei_api_key
		);
	} catch (error) {
		console.log("error", error);
	}

    res.json({success: true});

});

app.listen(3000,()=>{
    console.log("Telegram block started ");
})