#!/usr/bin/env python

import cv2
import os
import sys, getopt
import signal
import time
from edge_impulse_linux.image import ImageImpulseRunner
import requests
from flask import Flask, render_template, Response, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS,cross_origin
import threading
import base64
import sqlite3
import uuid
import datetime
import logging


async_mode = None
runner = None
show_camera = False
video_frame = None
videoCaptureDeviceId = 0

sysusername = os.environ['USERNAME']
syspassword = os.environ['PASSWORD']
tg_disable  = os.environ['TG_DISABLE']

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

CORS(app, resources={ r'/*': {'origins': '*'}}, supports_credentials=True)
socketio = SocketIO(app, async_mode=async_mode,cors_allowed_origins="*")

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/video_feed')
# def video_feed():
#     token = request.args.get('token')
#     # if is_authenticated(token):
#     #     return Response(gen(),mimetype='multipart/x-mixed-replace; boundary=frame')
#     # else:
#     #     raise ValueError('Authorization failed.')  
#     return Response(gen(),mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/capture', methods=['POST'])
def capture():
    global video_frame
    print("capture image")  
    key = "{rand}.jpg".format(rand=str(uuid.uuid4()))
    cv2.imwrite("/var/media/{key}".format(key=key), video_frame)
    sqlite_insert_with_param = """INSERT INTO 'snapshots'
                          ('filename','bird', 'ts') 
                          VALUES (?, ?, ?);"""

    data_tuple = (key, 'NA', datetime.datetime.now())
    insert_table(conn,sqlite_insert_with_param,data_tuple)

    cv2.imwrite('/var/media/frame.jpg', video_frame)
    requests.post('http://localhost:3000/send/image', data = {'title':'Bird', 'filename':'frame.jpg'})

    return jsonify({"success":"true","key":key}) 


@app.route('/api/tg', methods=['GET'])
def tg_status():
    global tg_disable
    data = {
        "status": tg_disable
    }
    return jsonify(data) 


@app.route('/api/tg-update', methods=['POST'])
def tg_status_update():
    global tg_disable
    tg_disable = request.json["status"]
    return jsonify({"status": tg_disable})

# @app.route('/api/tg/status/<status>', methods=['POST'])
# def tg_status_update(status):
#     global tg_disable
#     if status == "enable":
#         tg_disable = "N"
#     else:
#         tg_disable = "Y"

#     return jsonify({"status": tg_disable})


@app.route('/api/snapshots', methods=['GET'])
def snapshots():
    try:
        c = conn.cursor()
        c.execute("select * from snapshots")
        rows = c.fetchall()
        data = []
        for row in rows:
            item = {
                'id': row[0],
                'filename':row[1],
                'bird':row[2],
                'ts':row[3]
            }
            data.append(item)

        return jsonify(data) 
    except Exception as e:
        print(e)

@app.route('/api/delete-snap', methods=['POST'])
def deletesnap():
    try:
        print("called delete")
        id = request.json["id"]
        filename = request.json["filename"]
        c = conn.cursor()
        c.execute("delete from snapshots WHERE id=?",(id,))
        conn.commit()
        os.remove("/var/media/{filename}".format(filename= filename))
        return jsonify({"success":"true"}) 
    except Exception as e:
        print(e)

@socketio.on('connect')
def socket_connect():
    token = request.args.get('token')
    print("socket token ", token)
    if is_authenticated(token):
        print("auth succcess")
        return True
    else:
        print("auth NOT success")
        return False
    

@socketio.on('disconnect')
def socket_disconnect():
    print('Client disconnected')

def is_authenticated(token):
    s = base64.b64decode(token).decode('utf-8').split(':')
    username=s[0]
    password=s[1]
    print(username, password)
    if username == sysusername and password == syspassword:
        return True
    else:
        return False


def gen():
    global video_frame
    while True:
        ret, jpeg = cv2.imencode('.jpg', video_frame)
        frame = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
def now():
    return round(time.time() * 1000)

def get_webcams():
    port_ids = []
    for port in range(5):
        print("Looking for a camera in port %s:" %port)
        camera = cv2.VideoCapture(port)
        if camera.isOpened():
            ret = camera.read()[0]
            if ret:
                backendName =camera.getBackendName()
                w = camera.get(3)
                h = camera.get(4)
                print("Camera %s (%s x %s) found in port %s " %(backendName,h,w, port))
                port_ids.append(port)
            camera.release()
    return port_ids

def sigint_handler(sig, frame):
    print('Interrupted')
    if (runner):
        runner.stop()
    sys.exit(0)

signal.signal(signal.SIGINT, sigint_handler)

def help():
    print('python classify.py <path_to_model.eim> <Camera port ID, only required when more than 1 camera is present>')


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file,check_same_thread=False)
        return conn
    except Exception as e:
        print(e)

    return conn

def insert_table(conn, insert_table_sql,tuple):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(insert_table_sql,tuple)
        conn.commit()
    except Exception as e:
        print(e)

def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Exception as e:
        print(e)

def stream(img):
    _, jpeg = cv2.imencode('.jpg', img)
    jpegframe = jpeg.tobytes()
    jpegframe = base64.b64encode(jpegframe).decode('utf-8')
    jpegframedata = "data:image/jpeg;base64,{}".format(jpegframe)
    socketio.emit('stream', jpegframedata)

def main():
    global video_frame
    global videoCaptureDeviceId
    global tg_disable
    
    model = '/usr/src/app/modelfile.eim'
    last_sent = 0

    dir_path = os.path.dirname(os.path.realpath(__file__))
    modelfile = os.path.join(dir_path, model)

    print('MODEL: ' + modelfile)

    with ImageImpulseRunner(modelfile) as runner:
        try:
            model_info = runner.init()
            print('Loaded runner for "' + model_info['project']['owner'] + ' / ' + model_info['project']['name'] + '"')
            labels = model_info['model_parameters']['labels']
            
            port_ids = get_webcams()
            if len(port_ids) == 0:
                raise Exception('Cannot find any webcams')

            videoCaptureDeviceId = int(port_ids[0])


            camera = cv2.VideoCapture(videoCaptureDeviceId)
            ret = camera.read()[0]
            if ret:
                backendName = camera.getBackendName()
                w = camera.get(3)
                h = camera.get(4)
                print("Camera %s (%s x %s) in port %s selected." %(backendName,h,w, videoCaptureDeviceId))
                camera.release()
            else:
                raise Exception("Couldn't initialize selected camera.")

            next_frame = 0 # limit to ~10 fps here

            for res, img in runner.classifier(videoCaptureDeviceId):
                video_frame = img
                stream(img)

                if (next_frame > now()):
                    time.sleep((next_frame - now()) / 1000)

                # print('classification runner response', res)
                

                if "classification" in res["result"].keys():
                    print('Result (%d ms.) ' % (res['timing']['dsp'] + res['timing']['classification']), end='')
                    for label in labels:
                        score = res['result']['classification'][label]
                        print('%s: %.2f\t' % (label, score), end='')
                    print('', flush=True)

                elif "bounding_boxes" in res["result"].keys():
                    print('Found %d bounding boxes (%d ms.)' % (len(res["result"]["bounding_boxes"]), res['timing']['dsp'] + res['timing']['classification']))
                    pred_labels = []
                    for bb in res["result"]["bounding_boxes"]:
                        print('\t%s (%.2f): x=%d y=%d w=%d h=%d' % (bb['label'], bb['value'], bb['x'], bb['y'], bb['width'], bb['height']))
                        img = cv2.putText(img, "%s %s" %( bb['label'],round(bb['value']*100)),(bb['x']+2, bb['y']+10), cv2.FONT_HERSHEY_SIMPLEX,0.35, (0, 255, 0), 1)
                        img = cv2.rectangle(img, (bb['x'], bb['y']), (bb['x'] + bb['width'], bb['y'] + bb['height']), (0, 255, 0), 1)
                        pred_labels.append({
                            'label': bb['label'],
                            'score': round(bb['value']*100)
                        })
                    
                    stream(img)
                    

                    if len(res["result"]["bounding_boxes"]) > 0 :
                        socketio.emit('ei_event', pred_labels)
                        if (time.time()-last_sent) > 10 and tg_disable == "N":
                            try:
                                last_sent = time.time()
                                cv2.imwrite('/var/media/frame.jpg', img)
                                requests.post('http://localhost:3000/send/image', data = {'title':'Bird', 'filename':'frame.jpg'})
                                
                                
                            except Exception as e:
                                print(e) 


                        

                    

                if (show_camera):
                    cv2.imshow('edgeimpulse', img)
                    if cv2.waitKey(1) == ord('q'):
                        break

                next_frame = now() + 100
        finally:
            if (runner):
                runner.stop()


conn = create_connection("/var/data/sqlite.db")

if __name__ == "__main__":
    
    
    sql_create_snapshot_table = """ CREATE TABLE IF NOT EXISTS snapshots (
                                        id integer PRIMARY KEY AUTOINCREMENT,
                                        filename text NOT NULL,
                                        bird text,
                                        ts timestamp
                                    ); """

    if conn is not None:
        # create projects table
        create_table(conn, sql_create_snapshot_table)
        print("Table created")


    else:
        print("Error! cannot create the database connection.")

    t = threading.Thread(target=main, args=())
    t.daemon = True
    t.start()
    #app.run(host='0.0.0.0', port='8080', debug=False)
    socketio.run(app,host='0.0.0.0', port='8080', debug=False)