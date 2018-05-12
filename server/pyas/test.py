import mongodb

if __name__ == "__main__":
    item = mongodb.db('19491001').imagesource.find_one({'name':'bbe459f0-503a-11e8-8f30-d5e4febeea38.jpg'})

    mongodb.db('19491001').imagesource.update({'name': 'c34d7e50-538d-11e8-8934-8f5922d82a50.jpg'},{'$set':{'state':1}})

    if(item is None):
        print 'none'
    else:
        print item

    # for ana in mongodb.db('19491001').imagesource.find({'name':'bbe459f0-503a-11e8-8f30-d5e4febeea38.jpg'}):
    #     file = open('temp/test.jpg', 'wb')
    #     file.write(ana['source'])
    #     file.close()
    #     print type( ana['source'])