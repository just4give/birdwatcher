#!/bin/busybox sh

if [[ ! -z $CHECK_CONN_FREQ ]] 
    then
        freq=$CHECK_CONN_FREQ
    else
        freq=120
fi



sleep 5

while [[ true ]]; do
    echo "Is device connected to internet?"
    wget --spider --no-check-certificate 1.1.1.1 > /dev/null 2>&1

    #echo $?

    if [ $? -eq 0 ]; then
        echo "All set! Your device is connected to the internet."
        SERVICE_STATUS=$(curl -sL "$BALENA_SUPERVISOR_ADDRESS/v2/applications/state?apikey=$BALENA_SUPERVISOR_API_KEY" | jq -r '.birdwatcher.services.web.status')
        echo "Current web container staus: $SERVICE_STATUS"

        if [[ "$SERVICE_STATUS" == "exited" ]]; then
            echo "web container stopped. Should start."
            
            curl -sL --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v2/applications/$BALENA_APP_ID/start-service?apikey=$BALENA_SUPERVISOR_API_KEY" -d '{"serviceName": "web"}'

            echo "web container started"
            
        else
            echo "web already running. Skip..."

        fi

        
    else
        echo "!!! Your device is NOT connected to the internet."
        curl -sL --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v2/applications/$BALENA_APP_ID/stop-service?apikey=$BALENA_SUPERVISOR_API_KEY" -d '{"serviceName": "web"}'
        echo "web container stopped"
    fi

    sleep $freq

done


#curl "$BALENA_SUPERVISOR_ADDRESS/v2/applications/state?apikey=$BALENA_SUPERVISOR_API_KEY"
#curl -sL --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v2/applications/$BALENA_APP_ID/stop-service?apikey=$BALENA_SUPERVISOR_API_KEY" -d '{"serviceName": "web"}'
#curl --header "Content-Type:application/json" "$BENA_SUPERVISOR_ADDRESS/v2/applications/$BALENA_APP_ID/start-service?apikey=$BALENA_SUPERVISOR_API_KEY" -d '{"serviceName": "web"}'

