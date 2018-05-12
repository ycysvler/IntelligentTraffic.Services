import sys
sys.path.append("./dll")
from IVehicleCalculator import vehicleMaster
import os
import cv2
import time

modelDir = r'/home/zhq/install_lib/vehicleDll/models'
master = vehicleMaster(modelDir,0,True,True,True)

def run():
    modelDir = r'/home/zhq/install_lib/vehicleDll/models'
    master = vehicleMaster(modelDir,0,True,True,False)
    picDir = r'/home/zhq/project/testPic/'

    for picName in os.listdir(picDir):
        print picDir+picName
        im = cv2.imread(picDir+picName)
        start = time.time()

        result = master.detect(im)
	print result
        end = time.time()

        print "cost time: ",(end-start)*1000,"ms","*********",len(result)

if __name__ == '__main__':
    run()
