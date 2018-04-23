/**
 * Created by ZHQ on 2017/8/3.
 */
module.exports = {
    uri: 'mongodb://10.10.22.209/',
    options: {
        useMongoClient: true,
        server: {socketOptions: {keepAlive: 1}},
        replset:{socketOptions: {keepAlive: 1}}
    }
};
