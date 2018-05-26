let Redis = require('ioredis');
let rediscfg = require('../config/redis');
let redis = new Redis(rediscfg);
let moment = require('moment');
let getMongoPool = require('../mongo/pool');

redis.on('message', function (channel, message) {
    console.log(channel, message);

    let obj = JSON.parse(message);
    //console.log(obj);

    if(obj.platenumber.length > 2)
        analysis(obj);
});

console.log('analysiss service start!');


async function analysis(data) {


    let vehicle = await getVehicle(data.platenumber);
    if (vehicle) {
        // 已存在，判断套牌逻辑
        if(vehicle.vehiclebrand != data.vehiclebrand
            || vehicle.vehiclemodel != data.vehiclemodel
            || vehicle.vehicleyear != data.vehicleyear
            || vehicle.vehiclemaker != data.vehiclemaker
            || vehicle.vehiclecolor != data.vehiclecolor
            || vehicle.vehicletype != data.vehicletype
            || vehicle.vehiclescore != data.vehiclescore){
            let Illegally = getMongoPool('analysis').Illegally;
            let illegally = new Illegally();
            illegally.platenumber = data.platenumber;
            illegally.analysisid = data._id;
            illegally.state = 0;
            illegally.snaptime = moment( data.snaptime+"Z");
            illegally.createtime = moment();
            illegally.save((err, item)=>{})
        }

    } else {
        // 新增逻辑
        await createVehicle(data);
    }
    let Appear = getMongoPool('analysis').Appear;
    // 记录出现过
    let appear = new Appear();
    appear.platenumber = data.platenumber;
    appear.analysisid = data._id;
    appear.snaptime = moment( data.snaptime+"Z");
    appear.createtime = moment();
    appear.save((err, item)=>{})
}

redis.subscribe(
    'vehicle',
    function (err, count) {
    });

async function createVehicle(data){
    let Vehicle = getMongoPool('analysis').Vehicle;
    // 新增逻辑
    let newItem = new Vehicle();
    newItem.platenumber = data.platenumber;
    newItem.platecolor = data.platecolor;
    newItem.platetype = data.platetype;
    newItem.vehiclebrand = data.vehiclebrand;
    newItem.vehiclemodel = data.vehiclemodel;
    newItem.vehicleyear = data.vehicleyear;
    newItem.vehiclemaker = data.vehiclemaker;
    newItem.vehiclecolor = data.vehiclecolor;
    newItem.vehicletype = data.vehicletype;
    newItem.vehiclescore = data.vehiclescore;
    newItem.createtime = moment( data.snaptime+"Z");

    return new Promise(function (resolve, reject) {
        newItem.save((err, item) => {
            if (err)
                return reject(err);
            else {
                resolve(item);
            }
        });
    });
}

async function getVehicle(platenumber) {
    let Vehicle = getMongoPool('analysis').Vehicle;

    return new Promise(function (resolve, reject) {
        Vehicle.findOne({'platenumber': platenumber}, (err, item) => {
            if (err)
                return reject(err);
            else {
                resolve(item);
            }
        });
    });
}


