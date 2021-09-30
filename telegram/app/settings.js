const axios = require('axios');
const SdkInstanceFactory = require("balena-sdk");


const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const TG_TOKEN =  process.env.TG_TOKEN ||''; 
const TG_CHAT_ID = process.env.TG_CHAT_ID ||'';
const EI_API_KEY_IMAGE = process.env.EI_API_KEY_IMAGE ||'';
const LATITUDE = process.env.LATITUDE ||'';
const LONGITUDE = process.env.LONGITUDE ||'';


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get('/settings/update-ei-keys', async (req, res)=>{

    res.json({success: true, "EI_API_KEY_IMAGE":EI_API_KEY_IMAGE});
});

app.post('/settings/update-ei-keys', async (req, res)=>{
    console.log("Update EI credentials ", req.body);

    let accountKey = "";
	try {
		const [{ id: serviceId }] = await sdk.models.service.getAllByApplication(
			Number(process.env.BALENA_APP_ID),
			{
				$select: "id",
				$filter: { service_name: "ei-processing" },
			}
		);
		accountKey = await sdk.models.device.serviceVar.get(
			process.env.BALENA_DEVICE_UUID,
			serviceId,
			"EI_API_KEY_IMAGE"
		);
	} catch (error) {
		console.log("error", error);
	}

    res.json({success: true});

});

app.listen(port, () => {
	sdk = SdkInstanceFactory();
	sdk.auth.logout();
	sdk.auth.loginWithToken(process.env.BALENA_API_KEY);
});