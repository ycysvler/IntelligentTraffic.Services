/*
 * 刷图片进数据库
 * */

let getMongoPool = require('../mongo/pool');
let moment = require('moment');
let mongoose = require('mongoose');
let async = require('async');

// 添加违法套牌数据
function createIllegally() {
    let Illegally = getMongoPool('analysis').Illegally;
    let item = new Illegally();
    item.platenumber = '京 P21G9B';
    item.state = 0;
    item.analysisid = "5af80e55322443ea702a95cf";
    item.snaptime = new moment('1949-10-01 12:00:00Z');
    item.createtime = new moment();
    item.save(function (err, item) {
        if (err)
            console.log(err);
        else
            console.log(item);
    });
}

async function test()
{
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
    console.log('result', results);
}
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


test();