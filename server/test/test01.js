/*
* 从车型文件将车型信息导入MongoDB
*
* */

let fs = require('fs');
let readline = require('readline');
let path = require('path');
let getMongoPool = require('../mongo/pool');


let fRead = fs.createReadStream('/home/zhq/Documents/vehicleTypeHeadID4.txt');


console.log('fs');


fRead.on('end', ()=>{
    console.log('end');
});

var objReadline = readline.createInterface({
    input: fRead,
    terminal: true
});

var index = 1;

objReadline.on('line', (line)=>{
    write2db(line);
    index++;
});

objReadline.on('close', ()=>{
    console.log('readline close...');
});

function write2db(line) {
    let fields = line.split('_');

    let VehicleType = getMongoPool('config').VehicleType;

    let item = new VehicleType();
    item.vehicletype = fields[0];
    item.vehiclebrand = fields[1];
    item.vehiclemaker = fields[2];
    item.vehiclemodel = fields[3];
    item.vehicleyear = fields[4];


    item.save(function (err, item) {
        console.log(index , item);
    });


}



