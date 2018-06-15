#!/usr/bin/python
# -*- coding: UTF-8 -*-
import MySQLdb
from log import logger
#-------------------------------------------------------------------------

class MySQL:
    def __init__(self, host="10.10.22.209", user="root", passwd="root"):
        # 打开数据库连接
        self.db = MySQLdb.connect(host, user, passwd, "deeplearning", charset='utf8' )
        logger.info({"content":'mysql host=%s username=%s password=%s'%(host, user, passwd)})    
        # 使用cursor()方法获取操作游标 
        self.cursor = self.db.cursor()        

    def close(self):
        self.db.close()
    
    def image_insert(self, item): 
        logger.info({"content":'insert image %s'%(item)}) 
        # SQL 插入语句
        sql = "INSERT INTO IMAGES(id, \
               image, date, servercode, status) \
               VALUES ('%s', '%s', '%s', '%d', '%d' )" % \
               (item['id'], item['image'], item['date'], 0, 0)
        
        try:
            # 执行sql语句
            self.cursor.execute(sql)
            # 提交到数据库执行
            self.db.commit()
        except:
            # 发生错误时回滚
            db.rollback()


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
    mysql.image_insert({'id':'332','image':'aa','date':'2018'})
    mysql.close()
     

