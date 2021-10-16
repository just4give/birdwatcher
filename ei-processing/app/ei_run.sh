#!/bin/sh

if [[ ! -z $CHECK_CONN_FREQ ]] 
    then
        freq=$CHECK_CONN_FREQ
    else
        freq=120
fi

if [ $EI_COLLECT_MODE_IMAGE = "Y" ];
then
    edge-impulse-linux --api-key $EI_API_KEY_IMAGE --disable-microphone
else
    edge-impulse-linux-runner --api-key $EI_API_KEY_IMAGE --download modelfile.eim
    python3 classify.py 
fi

sleep 5

while [[ true ]]; do
    echo "Checking internet connectivity ..."
    wget --spider --no-check-certificate 1.1.1.1 > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "Your device is connected to the internet."
        
    else
        echo "Your device is not connected to the internet."
        
    fi

    sleep $freq

done
