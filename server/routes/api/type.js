let moment = require('moment');
let uuid = require('uuid');
var path = require('path');
let Redis = require('ioredis');
let rediscfg = require('../../config/redis');

let pub = new Redis(rediscfg);
let getMongoPool = require('../../mongo/pool');

module.exports = function (router) {

    // PaaS -> 新建类型
    router.post('/types', (req, res, next) => {
        let entid = req.ent.entid;
        let ImageType = getMongoPool(entid).ImageType;

        /* 待实现 */
        let item = new ImageType(req.body);
        item.createtime = new moment();
        item.save(function (err, item) {
            // 因为做了name & code 的唯一主键判断，所以加了个异常处理
            if(err){
                res.json(500,err.errmsg);
            }
            else{
                res.json(item);
            }
        });
    });

    // PaaS -> 获取类型列表
    router.get('/types', (req, res, next) => {
        let entid = req.ent.entid;
        let ImageType = getMongoPool(entid).ImageType;

        ImageType.find(function (err, items) {
            res.json(items);
        });
    });

    // PaaS -> 增量计算此分类特征
    router.get('/types/:code/feature',(req, res, next)=>{
        let entid = req.ent.entid;
        let code = req.params.code;
        let message = JSON.stringify({entid:entid,type:code});
        pub.publish('Feature:BuildFeature', message);
        res.send(true);
    });

    // PaaS -> 删除类型
    router.delete('/types/:code', (req, res, next) => {
        let entid = req.ent.entid;
        let code = req.params.code;

        let ImageType = getMongoPool(entid).ImageType;
        ImageType.remove({code: code}, function (err) {
            if (err) return handleError(err);
            res.send(200, true);
        });

        /* 待实现 */
        /* 同时要删除与此类型相对应的索引信息  */
        let ImageIndex = getMongoPool(entid).ImageIndex;
        ImageIndex.remove({type: code}, function (err) {
            if (err) return handleError(err);
        });
        /* 同时要删除与此类型相对应的索引文件  */
        /* 同时要删除与此类型相对应的图像信息  */
        let Image = getMongoPool(entid).Image;
        Image.remove({type: code}, function (err) {
            if (err) return handleError(err);
        });
    });
}