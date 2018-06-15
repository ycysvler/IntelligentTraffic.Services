#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import os
import sys
import time
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


if __name__ == "__main__":
    # 格式化成2016-03-20 11:45:39形式 
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', type=str, default = time.strftime("%Y%m%d", time.localtime()) )
    args = parser.parse_args()
     
    logger.info({"content":'---------------- [ %s ] ----------------'%(args.date)})
     
    ftp = MyFtp(host,args.date) 
    ftp.Login(username, password) 
    ftp.DownLoadByDate()
    ftp.close()
     
