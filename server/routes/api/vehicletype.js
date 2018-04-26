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

    // PaaS -> 查询 -> 车型识别 > 车辆分类
    router.get('/vehicletype/vehicletype', (req, res, next) => {

        let doc = getMongoPool('config').VehicleType;
        doc.distinct('vehicletype',null, function (err, item) {
            if(!err){
                res.json(200, item);
            }else{
                res.json(500, err);
            }
        });
    });

    // PaaS -> 查询 -> 车型识别 > 品牌
    router.get('/vehicletype/vehiclebrand', (req, res, next) => {

        let doc = getMongoPool('config').VehicleType;
        doc.distinct('vehiclebrand',null, function (err, item) {
            if(!err){
                res.json(200, item);
            }else{
                res.json(500, err);
            }
        });
    });

    // PaaS -> 查询 -> 车型识别 > 型号
    router.get('/vehicletype/vehiclemodel/:vehiclebrand', (req, res, next) => {

        let vehiclebrand = req.params.vehiclebrand;

        let doc = getMongoPool('config').VehicleType;
        doc.distinct('vehiclemodel',{"vehiclebrand":vehiclebrand}, function (err, item) {
            if(!err){
                res.json(200, item);
            }else{
                res.json(500, err);
            }
        });
    });

    // PaaS -> 查询 -> 车型识别 > 型号
    router.get('/vehicletype/vehicleyear/:vehiclemodel', (req, res, next) => {

        let vehiclemodel = req.params.vehiclemodel;

        let doc = getMongoPool('config').VehicleType;
        doc.distinct('vehicleyear',{"vehiclemodel":vehiclemodel}, function (err, item) {
            if(!err){
                res.json(200, item);
            }else{
                res.json(500, err);
            }
        });
    });
}
