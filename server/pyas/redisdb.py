#coding=utf-8
import redis

# host是redis主机，需要redis服务端和客户端都起着 redis默认端口是6379
pool = redis.ConnectionPool(host='192.168.31.233', password='123456', port=6379, decode_responses=True)

def db():
    return redis.Redis(connection_pool=pool)

