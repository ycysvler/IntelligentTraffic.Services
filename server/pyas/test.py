import mongodb

if __name__ == "__main__":
    for ana in mongodb.db('19491001').imagesource.find({'name':'bbe459f0-503a-11e8-8f30-d5e4febeea38.jpg'}):
        file = open('temp/test.jpg', 'wb')
        file.write(ana['source'])
        file.close()
        print type( ana['source'])