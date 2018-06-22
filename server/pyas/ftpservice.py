#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import os
import sys
import time
import datetime
import argparse
import json 
import config
from ftp import MyFTP
from log import logger
from ctypes import * 
from concurrent.futures import ThreadPoolExecutor

reload(sys)
sys.setdefaultencoding('utf-8') 

# 不确定FTP服务编码,我的是gbk: 'UTF-8','gbk','GB2312','GB18030','Big5','HZ'
descode = 'gbk'
# 链接FTP的配置数据
host = config.ftp['host'] 
username = config.ftp['user'] 
password = config.ftp['passwd'] 
#-------------------------------------------------------------------------

def getYesterday():
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=-1)
    n_days = now + delta
    yestoday = n_days.strftime('%Y%m%d')
    return yestoday

def hello(msg,aa):
    print 'hello > ', msg , aa
    time.sleep(5)

if __name__ == "__main__":
    # 格式化成2016-03-20 11:45:39形式 
    parser = argparse.ArgumentParser()
    
    rundate = getYesterday()

    parser.add_argument('--date', type=str, default = rundate )
    args = parser.parse_args()
      
    rundate = args.date
 
    while True:
        logger.info({"content":'---------------- [ %s ] ----------------'%(rundate)})
        ftp = MyFTP(host,rundate) 
        ftp.Login(username, password) 
        ftp.DownLoadByDate()
        ftp.close()

        rundate = getYesterday()

        # sleep 10 second 
        time.sleep(10)
   
    
     
