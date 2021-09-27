#!/bin/sh

wget https://raw.githubusercontent.com/just4give/birdwatcher/master/data/birds.json 

if [ $EI_COLLECT_MODE_IMAGE = "1" ];
then
    edge-impulse-linux --api-key $EI_API_KEY_IMAGE
else
    edge-impulse-linux-runner --api-key $EI_API_KEY_IMAGE --download modelfile.eim
    python3 classify.py 
fi

