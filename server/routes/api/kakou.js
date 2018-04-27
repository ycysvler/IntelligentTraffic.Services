/**
 * Created by VLER on 2017/8/8.
 */
let multiparty = require('multiparty');
let moment = require('moment');
let uuid = require('uuid');
var path = require('path');
let fs = require('fs');

let getMongoPool = require('../../mongo/pool');

module.exports = function (router) {

    // PaaS -> 查询 -> 查询所有卡口
    router.get('/kakou', (req, res, next) => {

        let doc = getMongoPool('config').Kakou;
        doc.find({}, function (err, item) {
            if(!err){
                res.json(200, item);
            }else{
                res.json(500, err);
            }
        });
    });

    // PaaS -> 查询 -> 查询一个卡口
    router.get('/kakou/:kakouid', (req, res, next) => {
        let doc = getMongoPool('config').Kakou;

        let kakouid = req.params.kakouid;

        doc.findOne({kakouid: kakouid}, function (err, item) {
            if (err) {
                res.send(err);
            } else {
                res.send(200,item);
            }
        });
    });

    // 新建卡口
    router.post('/kakou', (req, res, next) => {
        let doc = getMongoPool('config').Kakou;
        let item = new doc(req.body);
        item.createtime = new moment();
        item.save(function (err, item) {
            // 因为做了name & code 的唯一主键判断，所以加了个异常处理
            if(err){
                res.json(500,err);
            }
            else{
                res.json(200,item);
            }
        });
    });
}
