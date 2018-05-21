#coding=utf-8
import sys
sys.path.append("../")

import redisdb

r = redisdb.db()
# key是"gender" value是"male" 将键值对存入redis缓存
r.set('gender', 'male')
# gender 取出键male对应的值
print(r.get('gender'))

r.publish('test01','hello word')
