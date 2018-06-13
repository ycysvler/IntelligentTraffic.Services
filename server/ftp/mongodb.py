#!/usr/bin/python
# -*- coding: UTF-8 -*-
from pymongo import MongoClient
conn = MongoClient('192.168.31.200', 27017)
def db(name):
    if(name == 'config'):
        return conn[name]
    else:
        return conn['intelligenttraffic_'+ name]

