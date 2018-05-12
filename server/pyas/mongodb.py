#!/usr/bin/python
# -*- coding: UTF-8 -*-
from pymongo import MongoClient
conn = MongoClient('192.168.31.233', 27017)
def db(name):
    return conn['intelligenttraffic_'+ name];

