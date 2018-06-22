#!/usr/bin/python
# -*- coding: UTF-8 -*-
from pymongo import MongoClient
import config

conn = MongoClient(config.mongodb['host'], config.mongodb['port'])
def db(name):
    if(name == 'config'):
        return conn[name]
    else:
        return conn['intelligenttraffic_'+ name]

