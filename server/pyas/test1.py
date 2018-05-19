#coding=utf-8
import sys
import mongodb
import time
import os
import cv2
import numpy
sys.path.append("./dll")

from IVehicleCalculator import vehicleMaster
modelDir = r'/home/zhq/install_lib/vehicleDll/models'
master = vehicleMaster(modelDir,0,True,True,False)

def adapterAnalysis(dbdate, snaptime, name, kakouid, vehicle ):
    analysis = mongodb.db(dbdate).analysis
    item = {}
    item['name'] = name
    item['kakouid'] = kakouid
    item['vehiclezone'] = {
        "x": vehicle['vehicleZone'][0],
        "y": vehicle['vehicleZone'][1],
        "width": vehicle['vehicleZone'][2] - vehicle['vehicleZone'][0],
        "height": vehicle['vehicleZone'][3] - vehicle['vehicleZone'][1]
    }

def run():
    date = '20170427'
    i = 0
    for item in mongodb.db(date).imagesource.find():
        start = time.time()
        imagepath = 'temp/' + item['name']
        file = open(imagepath, 'wb')
        file.write(item['source'])
        file.close()
        # 计算特征值
        im = cv2.imread(imagepath)
        result = master.detect(im)
        # 删除临时图片
        os.remove(imagepath)
        end = time.time()

        adapterAnalysis(date, '', item.name, item.kakouid, result)
        print "cost time: ", (end - start) * 1000, "ms", "*********", item['name']
        i=i+1
        if(i>3):
            return

if __name__ == '__main__':
    run()
