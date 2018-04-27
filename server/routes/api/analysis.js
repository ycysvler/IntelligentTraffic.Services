/**
 * Created by VLER on 2017/8/8.
 */
let multiparty = require('multiparty');
let moment = require('moment');
let uuid = require('uuid');
let path = require('path');
let async = require('async');
let fs = require('fs');
let mongoose = require('mongoose');

let getMongoPool = require('../../mongo/pool');

module.exports = function (router) {

    // PaaS -> 创建分析结果
    router.post('/analysis/:date', (req, res, next) => {
        let date = req.params.date;
        let body = req.body;
        let Analysis = getMongoPool(date).Analysis;
        let item = new Analysis();

        item.imageid = new mongoose.Types.ObjectId(body.imageid);
        item.name = body.name;
        item.kakouid= body.kakouid;
        item.vehiclezone = body.vehiclezone;

        item.platehasno = body.platehasno;
        item.platecolor = body.platecolor;
        item.platenumber = body.platenumber;
        item.platetype = body.platetype;

        item.vehiclebrand = body.vehiclebrand;
        item.vehiclemodel = body.vehiclemodel;
        item.vehicleyear = body.vehicleyear;
        item.vehiclemaker = body.vehiclemaker;
        item.vehiclecolor = body.vehiclecolor;
        item.vehicletype = body.vehicletype;


        item.save(function (err, data) {
            if(err){
                res.json(500, err);
            }else{
                res.json(200, data);
            }
        });
    });

    // PaaS -> 查询 -> 查询分析详情
    router.get('/analysis/info/:date/:id', (req, res, next) => {
        // connect 使用 appid 换算出 entid
        let date = req.params.date;
        let id = req.params.id;
        let Analysis = getMongoPool(date).Analysis;
        Analysis.findOne({_id: id}, function (err, item) {
            res.json(item);
        });
    });

    // 按车型搜索：品牌、型号、年款、车牌、时间、卡口ID
    router.post('/analysis/search/1', (req, res, next) => {
        let datas = ['20180501'];

        let param = {
            kakouid:{$in:req.body.kakouid},
            platenumber:req.body.platenumber,
            vehiclebrand:req.body.vehiclebrand,
            vehiclemodel:req.body.vehiclemodel,
            vehicleyear:req.body.vehicleyear,
            vehiclemaker:req.body.vehiclemaker,
            vehicletype:req.body.vehicletype
        };

        // 去掉无效查询条件
        for(let name in param){

            if(!req.body.hasOwnProperty(name) || req.body[name].length == 0){

                delete param[name];
            }
        }


        let asyncfn = [];

        for(let i in datas){
            let d = datas[i];
            let fn = (callback)=>{
                console.log('find in ', d);
                let Analysis = getMongoPool(d).Analysis;
                Analysis.find(param, function (err, item) {
                    callback(err, item);
                });
            };
            asyncfn.push(fn);
        }

        async.parallel(asyncfn,
            (err, items)=>{
                if(err){
                    res.send(500, err);
                }else{
                    let results = [];
                    for(let i in items){
                        results = results.concat(items[i]);
                    }
                    res.json(200, results);
                }
            });
    });
}
