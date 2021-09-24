
# Bird Watcher using Edge Impulse Linux SDK and BalenaOS

This project enables you to run Edge Impulse Linux SDK on balenaOS thus allowing you to manage a fleet of devices with the same software stack on them which can do various kinds of on-device Machine Learning applications. 

<p align="center">
  <kbd><img src="https://user-images.githubusercontent.com/9275193/134690393-81401c86-6e13-40c9-9670-c55f286e6979.gif" border="1px solid red"></kbd>
</p>

### To-Do List

- [X] hostname: confirm that http://birdwatcher.local works if you are on the same network than the Bird Watcher.
- [ ] Home: List birds watched nearby the real-time picture. IDEA: list (with text) of birds spotted with the date and link to Snaps?
- [ ] Snaps: check title of Snaps (I see `motion` instead of the bird name)
- [ ] Snaps: pictures of watched to train the ML shouldn't have the box with the name of the bird. Solution: store picture with no box and with box. We will show on Snaps the picture with box and send to Edge Impulse the picture without box.
- [ ] Settings: Add GPS (lat and lon form) of the Bird Watcher.
- [ ] Settings: Add the possibility to add Telegram information.
- [ ] Settings: Add the possibility to make the Bird Watcher public or private.
- [ ] Settings: Add the possibility to change password of the UI.
- [ ] Make a cron to get Device Variables from the balenaCloud fleet and create a markdown file on github with the list of Bird Watchers (location + telegram link).
- [ ] Telegram: check about group bots to add more people on the channel.


#### 3D Printed Unit
<p align="center">
<img src="https://user-images.githubusercontent.com/9275193/134356486-bf4fd607-67fb-47bb-9bed-d8437b1f1fb0.jpg" width="500" >
</p>

#### Website on Mobile
<p align="center">
<img src="https://user-images.githubusercontent.com/9275193/134356635-9b320230-f2cd-4b95-b2a2-9ae38bf87aeb.PNG" width="500" >
</p>


### Hardware 
<table>
<tr><td>
<img height="24px" src="https://files.balena-cloud.com/images/fincm3/2.58.3%2Brev1.prod/logo.svg" alt="fincm3" style="max-width: 100%; margin: 0px 4px;"></td><td> balenaFin</td>
</tr>
<tr><td>
<img height="24px" src="https://files.balena-cloud.com/images/raspberrypi3/2.58.3%2Brev1.prod/logo.svg" alt="raspberrypi3" style="max-width: 100%; margin: 0px 4px;"></td><td>Raspberry Pi 3 Model B+</td>
</tr>
<tr><td>
<img height="24px" src="https://files.balena-cloud.com/images/raspberrypi4-64/2.65.0%2Brev1.prod/logo.svg" alt="raspberrypi4-64" style="max-width: 100%; margin: 0px 4px;"></td><td>Raspberry Pi 4 Model B</td>
</tr>
</table>

 [Raspberry Pi camera](https://www.raspberrypi.org/products/camera-module-v2/) or any USB camera.

### Software 

* Sign up for a free [Edge Impulse account](https://edgeimpulse.com/)
* Sign up for a free [BalenaCloud account](https://www.balena.io/)
* [balenaEtcher](https://www.balena.io/etcher/)

### Deploy using balenaCloud

Click on the *deploy-with-balena* button as given below, which will help you to deploy your application to balenaCloud and then to your Raspbery Pi in **one-click!**

[![](https://balena.io/deploy.png)](https://dashboard.balena-cloud.com/deploy?repoUrl=https://github.com/just4give/balena-ei-linux-bird-watcher)

Else you can build your own release by cloning this repo on your primary machine (x86) and use the following commands :
```
$ git clone https://github.com/just4give/balena-ei-linux-bird-watcher.git
$ cd balena-ei-linux-bird-watcher
$ balena login
$ balena push balena-ei-linux-bird-watcher 
```

### Data Collection Mode

Set the variable to 1 which will bring the application to data collection mode. 
```
EI_COLLECT_MODE_IMAGE
``` 
and follow the instructions being laid down in the terminal.

### Enable Motion

Sometimes you may need to unknown bird's image and feed to your EI model and retrain. For this, you can enable motion detection by setting the variable to Y
```
ENABLE_MOTION
```

### Enable Motion

If you wish to turn off telegram notification for any reason, you can set below variable to N ( set back to Y if you like to receive notification)
```
ENABLE_TG
```



### Download 3D models and Print 
<p align="center">
<img src="https://user-images.githubusercontent.com/9275193/134372532-acc0f093-4939-49c1-af53-bea9a0a611dd.jpg" width="800" >

<img src="https://user-images.githubusercontent.com/9275193/134414458-c2913182-db20-4f9d-98b5-2b94f0e402fd.jpg" width="800" >
</p>
Download STL files from here [bird_watcher_3D_print.zip](https://github.com/just4give/balena-ei-linux-bird-watcher/files/7095446/bird_watcher_3dprint.zip)

