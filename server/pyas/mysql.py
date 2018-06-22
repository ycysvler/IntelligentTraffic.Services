#!/usr/bin/python
# -*- coding: UTF-8 -*-
import MySQLdb
import datetime
import uuid
import config

from log import logger
#-------------------------------------------------------------------------
print 'config',config.mysql

class MySQL:
    def __init__(self, host=config.mysql['host'], user=config.mysql['user'], passwd=config.mysql['passwd']):
        # 打开数据库连接
        self.db = MySQLdb.connect(host, user, passwd, "deeplearning", charset='utf8' )
        logger.info({"content":'mysql host=%s username=%s password=%s'%(host, user, passwd)})    
        # 使用cursor()方法获取操作游标 
        self.cursor = self.db.cursor()        

    def close(self):
        self.db.close()
    
    def image_insert(self, item): 
        logger.info({"content":'insert image param > %s'%(item)}) 
        now = datetime.datetime.now()
        t = now.strftime("%Y-%m-%d %H:%M:%S")
         
        # SQL 插入语句
        sql = "INSERT INTO IMAGES(id, image, date, servercode, status, createtime, downtime) \
               VALUES ('%s', '%s', '%s', '%d', '%d' , '%s', '%s')" % \
               (item['id'], item['image'], item['date'], 0, 0, t, t )
        logger.info({"content":'sql > %s'%(sql)})  
        try:
            # 执行sql语句
            self.cursor.execute(sql)
            # 提交到数据库执行
            self.db.commit()
        except Exception,e:
            # 发生错误时回滚
            logger.warning({"content":'%s'%e})
            self.db.rollback()

    def image_analytical(self, item): 
        logger.info({"content":'insert analytical param > %s'%(item)}) 
        now = datetime.datetime.now()
        t = now.strftime("%Y-%m-%d %H:%M:%S")
         
        # SQL 插入语句
        sql = "INSERT INTO ANALYTICAL(\
image, carlabel, brand, firms,model, version,carconfidence,\
colorlabel,colortype,colorconfidence,\
carclass,date) \
VALUES ('%s','%s','%s','%s','%s','%s',%s,'%s','%s',%s,'%s','%s')" % \
               (item['image'], item['carlabel'], item['brand'], item['firms'], item['model'], item['version'],item['carconfidence'], \
               item['colorlabel'],item['colortype'],item['colorconfidence'],\
               item['carclass'],item['date'])
        logger.info({"content":'insert analytical sql   > %s'%(sql)})  
        try:
            # 执行sql语句
            self.cursor.execute(sql)
            # 提交到数据库执行
            self.db.commit()
        except Exception,e:
            # 发生错误时回滚
            logger.warning({"content":'%s'%e})
            self.db.rollback()


    def tt(self):
        sql = "SELECT * FROM images limit 1"

        try:
            # 执行SQL语句
            self.cursor.execute(sql)
            # 获取所有记录列表
            results = self.cursor.fetchall()
            for row in results:
                id = row[0]
                image = row[1]
      
                # 打印结果
                print "id=%s,image=%s" %  (id, image )
        except:
            print "Error: unable to fecth data"

if __name__ == "__main__":
    mysql = MySQL()
    mysql.image_analytical({'image':'aaa','carlabel':'cl','brand':'brand','firms':'firms','model':'model', 'version':'version','carconfidence':0.9,'colorlabel':'cl','colortype':'colortype','colorconfidence':0.8,'carclass':'carclass','date':'20180909','flag':0})
    mysql.close()
     

