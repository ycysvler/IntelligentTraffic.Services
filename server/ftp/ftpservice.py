#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import os
import sys
import time
import datetime
import argparse
import json
from ftp import MyFtp
from log import logger
from ctypes import *

# 不确定FTP服务编码,我的是gbk: 'UTF-8','gbk','GB2312','GB18030','Big5','HZ'
descode = 'gbk'
# 链接FTP的配置数据
host = '192.168.31.200'
host = '10.10.22.209'
username = 'ftp' #'ycysvler@hotmail.com'
username = 'ycysvler@hotmail.com'
password = 'ftp' #'1qaz!QAZ'
password = '1qaz!QAZ'
#-------------------------------------------------------------------------

def getYestoday():
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=-1)
    n_days = now + delta
    yestoday = n_days.strftime('%Y-%m-%d')
    return yestoday

if __name__ == "__main__":
    # 格式化成2016-03-20 11:45:39形式 
    parser = argparse.ArgumentParser()
    
    rundate = getYestoday()

    parser.add_argument('--date', type=str, default = rundate )
    args = parser.parse_args()
      
    rundate = args.date

    while True:
        logger.info({"content":'---------------- [ %s ] ----------------'%(rundate)})
        ftp = MyFtp(host,rundate) 
        ftp.Login(username, password) 
        ftp.DownLoadByDate()
        ftp.close()

        rundate = getYestoday()

        # sleep 10 second 
        time.sleep(10)
   
    
     
