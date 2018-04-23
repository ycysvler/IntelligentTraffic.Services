/**
 * Created by VLER on 2017/8/26.
 */
let getMongoPool = require('../mongo/pool');

module.exports =(req, res, next) => {
    let Enterprise = getMongoPool("cabase").Enterprise;

    let appid = "";

    // 因为图片地址，没法改http头，所以要在url里面计算appid
    var isGetImage = req.url.indexOf('/images/data/') > -1;

    if(isGetImage){
        var urlParams = req.url.split('/');
        appid = urlParams[4];
    }else{
        //appid = req.headers["appid"]? req.headers["appid"] : 'ca52bf40-8a65-11e7-a0b9-1d87294b8940';
        appid = req.headers["appid"];
    }
    //appid = req.headers["appid"]? req.headers["appid"] : 'ca52bf40-8a65-11e7-a0b9-1d87294b8940';
    //console.log('content:entloader > appid : ',  appid);

    if(appid){
        // 传了APPID
        Enterprise.findOne({appid: appid}, function (err, item) {
            if (err) {
                res.send(500, err);
            } else {
                if(item){
                    req.ent = item;
                    //console.log('content:entloader > enterprise : ',  item);
                    next();
                }else{
                    res.send(404, '[appid] enterprise does not exist');
                }
            }
        });
    }else{
        console.log('url > ', req.url);
        res.send(401,'[appid] parameter is missing');
    }
}