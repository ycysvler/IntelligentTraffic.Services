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
from log import logger

#-------------------------------------------------------------------------

class MyFtp:
    ftp = FTP()
    ftp.encoding = 'utf8'
    descode = 'gbk'  
    
    # 'UTF-8','gbk','GB2312','GB18030','Big5','HZ'

    def __init__(self, host, port='21'):        
        self.ftp.connect( host, port )
            
    def Login(self, user, passwd):
        self.ftp.login( user, passwd ) 
        logger.info({"content":self.ftp.welcome})

    def DownLoadFile(self, LocalFile, RemoteFile):
        file_handler = open( LocalFile, 'wb' )
        self.ftp.retrbinary( "RETR %s" %( RemoteFile ), file_handler.write ) 
        file_handler.close()
        return True

    def show(self, list):
        result = list.lower().split( " " )
        if self.path in result and "<dir>" in result:
            self.bIsDir = True



    def isDir(self, path):
        self.bIsDir = False
        self.path = path
        #this ues callback function ,that will change bIsDir value
        self.ftp.retrlines( 'LIST', self.show )
        return self.bIsDir



    def DownLoadByDate(self, date):       
         
        LocalDir = 'image/' + date + '/'
        RemoteDir = '/' + LocalDir

        logger.info({"content":"start downloading > %s"%(RemoteDir)})

        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )

        try:        
            self.ftp.cwd(RemoteDir)
            lst = self.ftp.nlst()
            for item in lst: 
                file = item.decode(self.descode,'strict')  
                (shotname,extension) =  os.path.splitext(file)
                if extension == "":
                    self.DownLoadByDir(LocalDir + file + '/', RemoteDir + file + '/', item, date, file)               

        except Exception,e:
            logger.warning({"content":"%s"%e})

    def DownLoadByDir(self, LocalDir, RemoteDir, dirName,date,rowCode):  
        logger.info({"content":"start downloading > %s %s %s"%(date, rowCode, RemoteDir)})
        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )

        try:
            # mongodb image
            imagesource = mongodb.db(date).imagesource
            dbimagecount = imagesource.count({"kakouid":rowCode})  
            logger.info({"content":"   db image count > %s %s > %s"%(date, rowCode, dbimagecount)})

            self.ftp.cwd(RemoteDir)
            lst = self.ftp.nlst()
            ftpimagecount = len(lst)

            logger.info({"content":"  ftp image count > %s %s > %s"%(date, rowCode, ftpimagecount)})
            
            if ftpimagecount > dbimagecount or True:
                for item in lst: 
                    file = '%s'%item.decode(self.descode,'strict')
                     
                    #file = file.encode('utf8')
                    
                    # if image is type of 5
                    if self.checkFileIs5(file):
                        if self.checkFileExists(date, file):                                           
                            logger.info({"content":'     [ is exist ] > %s'%(file)})
                        else:                        
                            (shotname,extension) =  os.path.splitext(file) 
                            logger.info({"content":'    download file > %s'%(file)})
                            self.downloadfile(item, LocalDir + file)
                            # write mongodb
                            self.writeImageToDb(date, rowCode, file, LocalDir + file)

                    else: 
                        logger.info({"content":'   [ not type 5 ] > %s'%(file)})
            else:                
                logger.info({"content":'      no new file > %s %s'%(date, rowCode)})

        except Exception,e:   
            logger.warning({"content":'%s'%e})

    def writeImageToDb(self, date, rowCode,name,filename):
        imagesource = mongodb.db(date).imagesource

        UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
        utc = date[0:4] + '-' + date[4:6] + '-' + date[6:8] + 'T' + '12:00:00.000Z'         
        snaptime = datetime.datetime.strptime(utc, UTC_FORMAT)

        #获得一个collection        
        with open (filename,'rb') as myimage:  
            content = StringIO(myimage.read())  
            imagesource.insert(dict(  
            source= bson.binary.Binary(content.getvalue()),  
            name = name.encode('utf8'),
            state = 0,
            snaptime = snaptime,
            createtime = datetime.datetime.utcnow(),
            kakouid = rowCode
          ))  
         

    def checkFileIs5(self, fileName):
        strings = fileName.split('_')
        if len(strings) > 4:
            if strings[4] == '5':
                return True
        return False

    def checkFileExists(self, date, name):
        imagesource = mongodb.db(date).imagesource
        count = imagesource.count({'name':name.encode('utf8')}) 
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


def ftpconnect(host, username, password):
    ftp = FTP()
     
    ftp.encoding = 'utf8'
    #ftp.set_debuglevel(2)         #打开调试级别2，显示详细信息
    ftp.connect(host, 21)          #连接
    ftp.login(username, password)  #登录，如果匿名登录则用空串代替即可
    return ftp

def downloadDir(ftp, dir):
    lst = ftp.nlst() 
    for item in lst:
        if os.path.isdir( item ):
            a = 1
	else:
            file = item.decode(descode,'strict')
            print file
            downloadfile(ftp, item, file)  
    
def downloadfile(ftp, remotepath, localpath): 
    bufsize = 1024                #设置缓冲块大小
    fp = open(localpath,'wb')     #以写模式在本地打开文件
    ftp.retrbinary('RETR ' + remotepath, fp.write, bufsize) #接收服务器上文件并写入本地文件
    ftp.set_debuglevel(0)         #关闭调试
    fp.close()                    #关闭文件

def uploadfile(ftp, remotepath, localpath):
    bufsize = 1024
    fp = open(localpath, 'rb')
    ftp.storbinary('STOR '+ remotepath , fp, bufsize) #上传文件
    ftp.set_debuglevel(0)
    fp.close()   

def dir(ftp):
    lst = ftp.nlst()
    print lst
    for item in lst:
        print item  # item.decode('gbk','strict');                                 
def isDir( ftp, path ): 
    bIsDir = False
    path = path 
    #this ues callback function ,that will change bIsDir value 
    ftp.retrlines( 'LIST', self.show ) 
    return bIsDir
 
def close( self ): 
    self.ftp.quit()
 
