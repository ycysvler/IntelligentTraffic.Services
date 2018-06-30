#coding=utf-8
# -*- coding: UTF-8 -*-
import sys
import mongodb
import time
import os
import cv2
import datetime
#import redisdb
import argparse
from log import logger
from urllib import urlencode
from mysql import MySQL
reload(sys)
sys.setdefaultencoding('utf-8') 

#rds = redisdb.db()
mysql = MySQL()

from IVehicleCalculator import vehicleMaster

modelDir = r'/home/zzy/models'
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
    dt = datetime.datetime.strptime(utc, UTC_FORMAT)
    return dt

# 计算结果写数据库
def adapterAnalysis(dbdate, snaptime, name, kakouid, vehicle ):
    analysis = mongodb.db(dbdate).analysis
    #print vehicle
    item = {}
    item['name'] = name
    item['kakouid'] = kakouid
    item['vehiclezone'] = {
        "x": vehicle['vehicleZone'][0],
        "y": vehicle['vehicleZone'][1],
        "width": vehicle['vehicleZone'][2] - vehicle['vehicleZone'][0],
        "height": vehicle['vehicleZone'][3] - vehicle['vehicleZone'][1]
    }

    UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
    utc = dbdate[0:4] + '-' + dbdate[4:6] + '-' + dbdate[6:8] + 'T' + '12:00:00.000Z'         
    dt = datetime.datetime.strptime(utc, UTC_FORMAT)

    item['date'] = dt
    item['snaptime'] = item['date']
    item['platehasno'] = 0
    item['platetype'] = ''

    if 'vehiclePlateLicense' in vehicle:
        if vehicle["vehiclePlateLicense"] <> None:
            item['platecolor'] = vehicle['vehiclePlateLicense']['color']
            item['platenumber'] = vehicle['vehiclePlateLicense']['license']
            item['platehasno'] = 1
            

    # 如果没能计算出车型，就返回
    if not ('vehicleType' in vehicle)  or vehicle["vehicleType"] == None:
        logger.warning({"content":'vehicletype is None > %s %s %s'%(dbdate, kakouid, name)})
        return

    vehicleTypes = vehicle['vehicleType']['category'].split('_')
    item['vehiclecarclass'] = vehicleTypes[0]
    item['vehicletype'] = vehicleTypes[1]
    item['vehiclebrand'] = vehicleTypes[2]
    item['vehiclemaker'] = vehicleTypes[3]
    item['vehiclemodel'] = vehicleTypes[4] 
    item['vehicleyear'] = vehicleTypes[5]
    item['vehiclecolor'] = vehicle['vehicleColor']['category']
    item['vehiclescore'] = round(float(vehicle['vehicleType']['score']),4)

    item['vehicleposture'] = 0 if vehicle["vehiclePosture"]['category'] ==  "车头" else 1

    if 'vehicleStruct' in vehicle and vehicle["vehicleStruct"] <> None:
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

        if 'driveSeatZone' in vehicle["vehicleStruct"]:
            item['driverrdsSeatZone'] = {
                "x": vehicle["vehicleStruct"]["driveSeatZone"][0],
                "y": vehicle["vehicleStruct"]["driveSeatZone"][1],
                "width": vehicle["vehicleStruct"]["driveSeatZone"][2] - vehicle["vehicleStruct"]["driveSeatZone"][0],
                "height": vehicle["vehicleStruct"]["driveSeatZone"][3] - vehicle["vehicleStruct"]["driveSeatZone"][1],
                "score": vehicle["vehicleStruct"]["driveSeatZone"][4],
            }

        if 'skyRoof' in vehicle["vehicleStruct"]:
            item['skyRoof'] = {
                "x": vehicle["vehicleStruct"]["skyRoof"][0],
                "y": vehicle["vehicleStruct"]["skyRoof"][1],
                "width": vehicle["vehicleStruct"]["skyRoof"][2] - vehicle["vehicleStruct"]["skyRoof"][0],
                "height": vehicle["vehicleStruct"]["skyRoof"][3] - vehicle["vehicleStruct"]["skyRoof"][1],
                "score": vehicle["vehicleStruct"]["skyRoof"][4],
            }

    analysis.insert(item)
 
    # 发送分析通知，供大数据分析
    data = {}
#    data["platenumber"] = urlencode(item["platenumber"])
#    data["platecolor"] = urlencode(item["platecolor"])
#    data["platetype"] = urlencode(item["platetype"]) 
#    data["vehiclebrand"] = urlencode(item["vehiclebrand"])
#    data["vehiclemodel"] = urlencode(item["vehiclemodel"])
#    data["vehicleyear"] = urlencode(item["vehicleyear"])
#    data["vehiclemaker"] = urlencode(item["vehiclemaker"])
#    data["vehiclecolor"] = urlencode(item["vehiclecolor"])
#    data["vehicletype"] = urlencode(item["vehicletype"])
#    data["vehiclescore"] = urlencode(item["vehiclescore"])

    analitem = {}
    analitem['image'] = item['name']
    analitem['carlabel'] = 0
    analitem['brand'] = item['vehiclebrand']
    analitem['firms'] = item['vehiclemaker']
    analitem['model'] = item['vehiclemodel']
    analitem['version'] = item['vehicleyear']
    analitem['carconfidence'] = item['vehiclescore']
    analitem['colortype'] = item['vehiclecolor']
    analitem['colorlabel'] = 0
    analitem['colorconfidence'] = 1 
    analitem['date'] = dbdate
    analitem['carclass'] = item['vehiclecarclass']
    analitem['vehicletype'] = item['vehicletype']

    
    mysql.image_analytical(analitem)
    #rds.publish('vehicle',data)

# 昨天
def getYesterday():
    today = datetime.date.today()
    oneday = datetime.timedelta(days=1)
    yesterday = today-oneday
    return yesterday.strftime('%Y%m%d')

if __name__ == '__main__':

    # 格式化成2016-03-20 11:45:39形式 
    parser = argparse.ArgumentParser()

    date = getYesterday()
    #date = '20170427'

    parser.add_argument('--date', type=str, default = date )
    args = parser.parse_args()
      
    date = args.date


    while True: 
        logger.info({"content":'---------------- [ %s ] ----------------'%(date)})
        imagesources = mongodb.db(date).imagesource.find({'state':0})
        
        if os.path.isdir( 'temp' ) == False:
            os.makedirs( 'temp' )

        for item in imagesources: 
            logger.info({"content":'mongodb change state    > %s %s'%(date, item['name'])})
            mongodb.db(date).imagesource.update({'name':item['name']},{'$set':{'state':1}}) 
            logger.info({"content":'calculation             > %s %s'%(date, item['name'])})
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
            mongodb.db(date).imagesource.update({'name': item['name']}, {'$set': {'state': 2}})
            logger.info({"content":'calculation             > %s %s'%(date, item['name'])})
            logger.debug({"content":'cost time              > %s ms'%((end - start) * 1000)}) 

        
        logger.info({"content":'sleep %s`s '%(60)}) 
        time.sleep(60)
