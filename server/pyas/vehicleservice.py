#coding=utf-8
import sys
import os
import cv2
import time
import json
import numpy
import urllib
import mongodb
from multiprocessing import Process, Pipe
sys.path.append("./dll")

from IVehicleCalculator import vehicleMaster
from flask import Flask,request ,Response

parent_conn, child_conn = Pipe()

# 这里是一个单独的进程，用于计算特征
def caculator_progress(conn):
    modelDir = r'/home/zhq/install_lib/vehicleDll/models'
    master = vehicleMaster(modelDir, 0, True, True, False)
    print 'model init complete!'
    # 下面是计算流程
    while True:
        imagepath = conn.recv()
        im = cv2.imread(imagepath)
        result = master.detect(im)
        conn.send(result)

# 下面是Http处理部分
app = Flask(__name__)

@app.route('/caculator')
def caculator():
    date = request.args.get("date")
    image = request.args.get("image")

    if (date is None):
        return Response('[date] parameter is missing', status=403)
    if (image is None):
        return Response('[image] parameter is missing', status=403)

    print 'call date -> ', date , ' image -> ', image
    # 声明特征返回值
    result = None
    try:
        time_start = time.time()
        # 数据库查找图片
        item = mongodb.db(date).imagesource.find_one({'name': image})
        time_db_find = time.time()
        if (item is None):
            return Response( image + ' is missing', status=404)
        # 写临时u图片到磁盘
        imagepath = 'temp/' + item['name']
        file = open(imagepath, 'wb')
        file.write(item['source'])
        file.close()
        time_file_write = time.time()
        # 计算特征值
        #im = cv2.imread(imagepath)
        #result = master.detect(im)
        parent_conn.send(imagepath)
        time_vehicle_detect = time.time()
        result = parent_conn.recv()
        # 删除临时图片
        os.remove(imagepath)
        # 修改图片处理状态
        mongodb.db(date).imagesource.update({'name': image},{'$set':{'state':2}})
    except(ex1):
        return Response(str(ex1), status=500)
    else:
        print "db_find: ", (time_db_find - time_start) * 1000, "ms", "*********"
        print "file_write: ", (time_file_write - time_start) * 1000, "ms", "*********",(time_file_write - time_db_find) * 1000
        print "vehicle_detect: ", (time_vehicle_detect - time_start) * 1000, "ms", "*********",(time_vehicle_detect - time_file_write) * 1000
        print result
        return Response(json.dumps(result, cls=ComplexEncoder),mimetype='application/json')

# 用于json 序列化中处理numpy.float32类型
class ComplexEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, numpy.float32):
      return round(float(obj),4)
    else:
      return json.JSONEncoder.default(self, obj)

if __name__ == '__main__':
    process = Process(target=caculator_progress,args=(child_conn,))
    # 启动计算集成等待努力工作
    process.start()
    app.run(debug=False,host='0.0.0.0', port=7777)
