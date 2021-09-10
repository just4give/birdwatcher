import board
import digitalio
import time
pir_sensor = digitalio.DigitalInOut(board.D4)
pir_sensor.direction = digitalio.Direction.INPUT

while True:
    if pir_sensor.value:
        print("Motion detected")
    
    time.sleep(0.1)