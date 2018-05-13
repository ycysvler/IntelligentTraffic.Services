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
master = vehicleMaster(modelDir,0,True,True,True)

def run():
    date = '20170427'
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

        print "cost time: ", (end - start) * 1000, "ms", "*********", item['name'],result

if __name__ == '__main__':
    run()
