/**
 * Created by VLER on 2017/8/8.
 */
let getMongoPool = require('../../mongo/pool');
let moment = require('moment');
let uuid = require('uuid');
let mongoose = require('mongoose');
let async = require('async');

// 获取不重复的车牌
async function distPlatenumber(){
    return new Promise((resolve, reject) => {
        let Illegally = getMongoPool('analysis').Illegally;
        Illegally.distinct('platenumber', {"state": 0},
            (err, items) => {
                if(err)
                    reject(err);
                else
                    resolve(items);
            });
    });
}
// 获取违法记录索引
async function getIllegallyByPlatenumber(numbers){
    return new Promise((resolve, reject) => {
        let Illegally = getMongoPool('analysis').Illegally;
        Illegally.find({"platenumber": {$in:numbers}},
            (err, items) => {
                if(err)
                    reject(err);
                else
                    resolve(items);
            });
    });
}
// 获取违法数据原始分析数据
async function getAnalysiss(illegallys) {
    return new Promise((resolve, reject) => {
        async.map(illegallys,
            (item,cb)=>{
                let date = new moment(item.snaptime).format('YYYYMMDD');
                let Analysis = getMongoPool(date).Analysis;
                Analysis.find({_id:mongoose.Types.ObjectId(item.analysisid)},
                    'vehicletype vehiclecolor vehiclemaker vehicleyear vehiclemodel vehiclebrand platenumber date',
                    (err, analysis)=>{
                        cb(null,{platenumber:item.platenumber, items: analysis});
                    });
            },
            (err,results)=>{
                if(err)
                    reject(err);
                else
                    resolve(results);
            }
        )
    });
}

module.exports = function (router) {

    // PaaS -> 套牌 -> 查询
    router.get('/illegally',async (req, res, next) => {
        let pageSize = 8;
        let current = 1;
        let items = await distPlatenumber();
        items = items.slice((current - 1) * pageSize, current * pageSize);
        console.log('platenumbers', items);
        items = await getIllegallyByPlatenumber(items);
        console.log('illegallys', items);
        items = await getAnalysiss(items);
        console.log('analysisss', items);

        let map = new Map();
        items.forEach((item,index)=>{
            if(map.has(item.platenumber)){
                let array = map.get(item.platenumber);
                array = array.concat(item.items);
                map.set(item.platenumber, array);
            }else{
                map.set(item.platenumber, item.items);
            }
        });
        let results = [];
        for(let [key,value] of map.entries()){
            results.push({platenumber:key, items:value});
        }
        res.json(results);
    });
}
