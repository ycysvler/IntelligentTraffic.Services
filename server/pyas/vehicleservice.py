#coding=utf-8
import sys
import os
import cv2
import time
import json
import numpy
import urllib
import mongodb
sys.path.append("./dll")

from IVehicleCalculator import vehicleMaster
from flask import Flask,request ,Response


#modelDir = r'/home/zhq/install_lib/vehicleDll/models'
#master = vehicleMaster(modelDir,0,True,True,True)

# 用于json 序列化中处理numpy.float32类型
class ComplexEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, numpy.float32):
      return round(float(obj),4)
    else:
      return json.JSONEncoder.default(self, obj)

app = Flask(__name__)

@app.route('/caculator')
def caculator():
    date = urllib.unquote(request.args.get("date"))
    image =urllib.unquote(request.args.get("image"))

    item = mongodb.db(date).imagesource.find_one({'name': image})
    file = open('temp/' + item.name, 'wb')
    file.write(item['source'])
    file.close()

    #r = t2(image)
    #print r
    return Response(json.dumps(item.name, cls=ComplexEncoder),mimetype='application/json')
#    return str(r)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7777)
