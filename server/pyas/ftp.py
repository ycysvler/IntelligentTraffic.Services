#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import os
import sys
import time
import datetime
import logging
import argparse
import json
import pymongo
import mongodb
import chardet
import bson.binary
from cStringIO import StringIO
from ctypes import *
from ftplib import FTP 
import config
from log import logger
from concurrent.futures import ThreadPoolExecutor
#-------------------------------------------------------------------------

class MyFTP:
    ftp = FTP()
    ftp.encoding = 'utf8'
    descode = config.ftp['descode']   # gbk
    
    # 'UTF-8','gbk','GB2312','GB18030','Big5','HZ'

    def __init__(self, host,  date=time.strftime("%Y%m%d", time.localtime())):  
        self.host = host
        self.port = '21' 
        self.date = date  
        self.imagesource = mongodb.db(self.date).imagesource 
        self.ftp.connect( self.host, self.port )
        
            
    def Login(self, user, passwd):        
        self.ftp.login( user, passwd ) 
        logger.info({"content":'ftp host=%s username=%s password=%s'%(self.host, user, passwd)})    
        logger.info({"content":self.ftp.welcome})
  
    def DownLoadByDate(self):         
        LocalDir = 'image/' + self.date + '/'
        RemoteDir = '/image/' + self.date + '/'

        logger.info({"content":"start downloading > %s"%(RemoteDir)})

        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )

        try:        
            self.ftp.cwd(RemoteDir)
            lst = self.ftp.nlst()
            for item in lst: 
                # terrible chinese, terrible gbk
                file = item.decode(self.descode,'strict')
                # check item is dir
                (shotname,extension) =  os.path.splitext(file) 
                if extension == "":
                    self.DownLoadByDir(LocalDir + file + '/', RemoteDir + file + '/', file)               

        except Exception,e:
            logger.warning({"content":"%s"%e})

    def DownLoadByDir(self, LocalDir, RemoteDir, rowCode):  
        logger.info({"content":"start downloading > %s %s %s"%(self.date, rowCode, RemoteDir)})
        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )

        try:
            # mongodb image
            dbimagecount = self.imagesource.count({"kakouid":rowCode})  
            logger.info({"content":"   db image count > %s %s > %s"%(self.date, rowCode, dbimagecount)})

            self.ftp.cwd(RemoteDir)
            lst = self.ftp.nlst()
            ftpimagecount = len(lst)

            logger.info({"content":"  ftp image count > %s %s > %s"%(self.date, rowCode, ftpimagecount)})
            
            if ftpimagecount > dbimagecount or True: 
                # thread pool 
                with ThreadPoolExecutor(4) as executor:
                    for item in lst: 
                        executor.submit(self.pool, item, rowCode, LocalDir)  
            else:                
                logger.info({"content":'      no new file > %s %s'%(self.date, rowCode)})

        except Exception,e:   
            logger.warning({"content":'%s'%e})

    def pool(self, item, rowCode, LocalDir):
        # chinese file name
        file = '%s'%item.decode(self.descode,'strict')
        # check type of 5 image
        if self.checkFileIs5(file):
            # check the image is exist
            if self.checkFileExists(self.date, file):                                           
                logger.info({"content":' [ img is exist ] > %s'%(file)}) 
            else:
                logger.info({"content":'    download file > %s'%(file)})
                self.downloadfile(item, LocalDir + file)
                # write mongodb
                self.writeImageToDb(self.date, rowCode, file, LocalDir + file)
        else: 
            logger.info({"content":'   [ not type 5 ] > %s'%(file)}) 

    def writeImageToDb(self, date, rowCode,name,filename): 
        UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
        utc = date[0:4] + '-' + date[4:6] + '-' + date[6:8] + 'T' + '12:00:00.000Z'         
        snaptime = datetime.datetime.strptime(utc, UTC_FORMAT)
       
        #获得一个collection        
        with open (filename,'rb') as myimage:  
            content = StringIO(myimage.read())  
            self.imagesource.insert(dict(  
            source= bson.binary.Binary(content.getvalue()),  
            name = name.encode('utf8'),
            state = 0,
            snaptime = snaptime,
            createtime = datetime.datetime.utcnow(),
            kakouid = rowCode
          ))  
        # delete the image file
        os.unlink(filename)
         

    def checkFileIs5(self, fileName):
        strings = fileName.split('_')
        if len(strings) > 4:
            if strings[4] == '5':
                return True
        return False

    def checkFileExists(self, date, name): 
        count = self.imagesource.count({'name':name.encode('utf8')}) 
        return count > 0

    def downloadfile(self,remotepath, localpath): 
        bufsize = 1024                #设置缓冲块大小
        fp = open(localpath,'wb')     #以写模式在本地打开文件
        self.ftp.retrbinary('RETR ' + remotepath, fp.write, bufsize) #接收服务器上文件并写入本地文件
        self.ftp.set_debuglevel(0)    #关闭调试
        fp.close()                    #关闭文件
        return localpath
  
    def close(self): 
        logger.info({"content":'ftp quit'})
        self.ftp.quit()
 
