#!/usr/bin/env python 
#-*- coding: utf-8 -*-

import logging
import sys  
import os
import json
import time
from logging.handlers import RotatingFileHandler
#-------------------------------------------------------------------------
class MyLogger:

    # 创建一个logger
    logger = logging.getLogger('mylogger')

    def __init__(self):        
        self.logger.setLevel(logging.DEBUG)
        # 创建一个handler，用于写入日志文件
        log_dir = "./logs"
        if os.path.exists(log_dir) == False:  
            os.mkdir(log_dir)  

        date = time.strftime("%Y%m%d", time.localtime())    
        log_filename = log_dir+'/logfile'+ '.log'
 
        fh = RotatingFileHandler(log_filename, maxBytes=10*1024*1024,backupCount=10,encoding='utf8')
        fh.setLevel(logging.DEBUG)

        # 再创建一个handler，用于输出到控制台
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)

        # 定义handler的输出格式
        formatter = logging.Formatter('{"time":"%(asctime)s","level":"%(levelname)s","body":%(message)s}')
        #formatter = logging.Formatter('{"time":"%(asctime)s","level":"%(levelname)s","body":%(message)s')
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)

        # 给logger添加handler
        self.logger.addHandler(fh)
        self.logger.addHandler(ch)

    def debug(self, message):
        self.logger.debug(json.dumps(message,ensure_ascii=False))

    def info(self, message):
        self.logger.info(json.dumps(message,ensure_ascii=False))

    def warning(self, message):
        self.logger.warning(json.dumps(message,ensure_ascii=False))

    def error(self, message):
        self.logger.error(json.dumps(message,ensure_ascii=False))

logger = MyLogger()
