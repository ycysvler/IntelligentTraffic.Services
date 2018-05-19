#coding=utf-8
import sys
import mongodb
import time
import os
import cv2
from  datetime
import numpy
sys.path.append("../dll")

from IVehicleCalculator import vehicleMaster
modelDir = r'/home/zhq/install_lib/vehicleDll/models'
master = vehicleMaster(modelDir,0,True,True,False)

# 图片名称提取日期
def parseDatetimeFromName(name):
    year = name[0:4]
    month = name[4:6]
    day = name[6:8]
    hour = name[8:10]
    minute = name[10:12]
    second = name[12:14]
    UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
    utc = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.000Z'
    dt = datetime.strptime(utc, UTC_FORMAT)
    return dt

def adapterAnalysis(dbdate, snaptime, name, kakouid, vehicle ):
    analysis = mongodb.db(dbdate).analysis
    print vehicle
    item = {}
    item['name'] = name
    item['kakouid'] = kakouid
    item['vehiclezone'] = {
        "x": vehicle['vehicleZone'][0],
        "y": vehicle['vehicleZone'][1],
        "width": vehicle['vehicleZone'][2] - vehicle['vehicleZone'][0],
        "height": vehicle['vehicleZone'][3] - vehicle['vehicleZone'][1]
    }
    item['date'] = parseDatetimeFromName(name)
    item['snaptime'] = item['date']
    item['platehasno'] = 0
    item['platecolor'] = ''
    item['platenumber'] = ''
    item['platetype'] = ''

    vehicleTypes = vehicle['vehicleType']['category'].split('_')
    item['vehicletype'] = vehicleTypes[0]
    item['vehiclebrand'] = vehicleTypes[1]
    item['vehiclemaker'] = vehicleTypes[2]
    item['vehiclemodel'] = vehicleTypes[3]
    item['vehicleyear'] = vehicleTypes[4]
    item['vehiclecolor'] = vehicle['vehicleColor']['category']
    item['vehiclescore'] = round(float(vehicle['vehicleType']['score']),4)

    item['vehicleposture'] = 0 if vehicle["vehiclePosture"]['category'] ==  "车头" else 1

    if hasattr(vehicle, 'vehicleStruct'):
        item['withFrontWindowLabelInspection'] =1 if vehicle["vehicleStruct"]["withFrontWindowLabelInspection"] else 0
        item['withFrontWindowAccessories'] = 1 if vehicle["vehicleStruct"]["withFrontWindowAccessories"] else 0
        item['isTaxi'] = 1 if vehicle["vehicleStruct"]["isTaxi"] else 0
        item['withDriverSafetyBelt'] = 1 if vehicle["vehicleStruct"]["withDriverSafetyBelt"] else 0
        item['withSideSafetyBelt'] = 1 if vehicle["vehicleStruct"]["withSideSafetyBelt"] else 0
        item['withCellPhone'] = 1 if vehicle["vehicleStruct"]["withCellPhone"] else 0
        item['withFrontWindowObjects'] = 1 if vehicle["vehicleStruct"]["withFrontWindowObjects"] else 0
        item['withOtherPeopleOnSideSeat'] = 1 if vehicle["vehicleStruct"]["withOtherPeopleOnSideSeat"] else 0
        item['withSunShieldDown'] = 1 if vehicle["vehicleStruct"]["withSunShieldDown"] else 0
        item['withSkyRoof'] = 1 if vehicle["vehicleStruct"]["withSkyRoof"] else 0

        if hasattr(vehicle["vehicleStruct"], 'driveSeatZone'):
            item['driverSeatZone'] = {
                "x": vehicle["vehicleStruct"]["driveSeatZone"][0],
                "y": vehicle["vehicleStruct"]["driveSeatZone"][1],
                "width": vehicle["vehicleStruct"]["driveSeatZone"][2] - vehicle["vehicleStruct"]["driveSeatZone"][0],
                "height": vehicle["vehicleStruct"]["driveSeatZone"][3] - vehicle["vehicleStruct"]["driveSeatZone"][1],
                "score": vehicle["vehicleStruct"]["driveSeatZone"][4],
            }

        if hasattr(vehicle["vehicleStruct"], 'skyRoof'):
            item['skyRoof'] = {
                "x": vehicle["vehicleStruct"]["skyRoof"][0],
                "y": vehicle["vehicleStruct"]["skyRoof"][1],
                "width": vehicle["vehicleStruct"]["skyRoof"][2] - vehicle["vehicleStruct"]["skyRoof"][0],
                "height": vehicle["vehicleStruct"]["skyRoof"][3] - vehicle["vehicleStruct"]["skyRoof"][1],
                "score": vehicle["vehicleStruct"]["skyRoof"][4],
            }

    analysis.insert(item)

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
        for vehicle in result:
            adapterAnalysis(date, '', item['name'], item['kakouid'], vehicle)

        print "cost time: ", (end - start) * 1000, "ms", "*********", item['name']
        i=i+1
        if(i>1):
            return

if __name__ == '__main__':
    run()

