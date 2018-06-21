import sys
sys.path.append("../")
import mongodb
import datetime
'''
analysis = mongodb.db('20170427').analysis
items = analysis.find()
for item in items:
    print item
'''
year = '2018'
month = '05'
day = '26'
hour = '17'
minute = '17'
second = '00'
UTC_FORMAT = "%Y-%m-%d %H:%M:%S.%f"
utc = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.000'
dt = datetime.datetime.strptime(utc, UTC_FORMAT)
dt = dt - datetime.timedelta(hours=8)
users = mongodb.db('config').users

user = {}
user['userid'] = '27'
user['mobile'] = '13811101091'
user['entid'] = 'test'
user['password'] = 'pwd'
user['createtime'] = dt
result =  users.insert(user)
print result