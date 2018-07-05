#!/usr/bin/env python 
#-*- coding: utf-8 -*-

# host:数据库ip,     user:用户名     passwd：密码     score:车型置信度，小于这个值不记录
mysql = {'host':'192.168.31.200', 'user':'root', 'passwd':'root' ,'score':0.8}
# host:数据库ip,     port:端口号
mongodb = {'host':'192.168.31.200', 'port':27017}
# host:数据库ip,     user:用户名     passwd：密码     
# descode:服务器编码，通过这个配置解决中文乱码，可选值 'UTF-8','gbk','GB2312','GB18030','Big5','HZ'
ftp = {'host':'192.168.31.200', 'user':'cgq', 'passwd':'cgq','descode':'gbk'}
