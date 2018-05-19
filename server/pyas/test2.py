#coding=utf-8
import redis

# host是redis主机，需要redis服务端和客户端都起着 redis默认端口是6379
pool = redis.ConnectionPool(host='localhost',password='123456', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=pool)
# key是"gender" value是"male" 将键值对存入redis缓存
r.set('gender', 'male')
# gender 取出键male对应的值
print(r.get('gender'))

