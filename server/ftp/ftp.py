#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import os
import sys
import time
import logging
import argparse
import json
from mongodb import db
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

    
    def dir(self):
        lst = self.ftp.retrlines( 'LIST' )
        result = lst.lower().split( "\n" )
        for item in result:
            print item.decode(self.descode,'strict')
            print '----'
         

    def nlst(self):
        descode = 'gbk'
        lst = self.ftp.nlst()
        for item in lst: 
            file = item.decode(descode,'strict') 
            (shotname,extension) =  os.path.splitext(file)
            print extension
    

    def isDir(self, path):
        self.bIsDir = False
        self.path = path
        #this ues callback function ,that will change bIsDir value
        self.ftp.retrlines( 'LIST', self.show )
        return self.bIsDir

    def DownLoadFileTree(self, LocalDir, RemoteDir):
        print "remoteDir:", RemoteDir
        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )
        self.ftp.cwd( RemoteDir )
        RemoteNames = self.ftp.nlst()  
        print "RemoteNames", RemoteNames
        print self.ftp.nlst("/del1")
        for file in RemoteNames:
            Local = os.path.join( LocalDir, file )
            if self.isDir( file ):
                self.DownLoadFileTree( Local, file )                
            else:
                self.DownLoadFile( Local, file )
        self.ftp.cwd( ".." )
        return

    def DownLoadByDate(self, LocalDir, RemoteDir):
        LocalDir = 'image/' + LocalDir + '/'
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
                    self.DownLoadByDir(LocalDir + file + '/', RemoteDir + file + '/', item)               

        except Exception,e:   
            logger.warning(json.dumps({"content":e}))

    def DownLoadByDir(self, LocalDir, RemoteDir, dirName):  
        logger.info({"content":"start downloading > %s [code > %s]"%(RemoteDir,dirName)})
        if os.path.isdir( LocalDir ) == False:
            os.makedirs( LocalDir )

        try:        
            self.ftp.cwd(RemoteDir)
            lst = self.ftp.nlst()
            for item in lst: 
                file = item.decode(self.descode,'strict')  
                # if image is type of 5
                if self.checkFileIs5(file):
                    if self.checkFileExists(file):                                           
                        logger.info({"content":'     [ is exist ] > %s'%(file)})
                    else:                        
                        (shotname,extension) =  os.path.splitext(file) 
                        logger.info({"content":'    download file > %s'%(file)})
                        self.downloadfile(item, LocalDir + file)
                        # write mongodb
                else: 
                    logger.info({"content":'       not type 5 > %s'%(file)})

        except Exception,e:   
            logger.warning({"content":e})

    def checkFileIs5(self, fileName):
        strings = fileName.split('_')
        if len(strings) > 4:
            if strings[4] == '5':
                return True
        return False

    def checkFileExists(self, filename):
        return False

    def downloadfile(self,remotepath, localpath): 
        bufsize = 1024                #设置缓冲块大小
        fp = open(localpath,'wb')     #以写模式在本地打开文件
        self.ftp.retrbinary('RETR ' + remotepath, fp.write, bufsize) #接收服务器上文件并写入本地文件
        self.ftp.set_debuglevel(0)    #关闭调试
        fp.close()                    #关闭文件
  
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
 
