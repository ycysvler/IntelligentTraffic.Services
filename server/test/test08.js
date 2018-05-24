var fs = require("fs");
var path = require("path");
const request = require('request');
let getMongoPool = require('../mongo/pool');
let moment = require('moment');
let mongoose = require('mongoose');
const config_calculator = require('../config/calculator');

function readDirSync(path){
    var pa = fs.readdirSync(path);
    pa.forEach(function(ele,index){
        var info = fs.statSync(path+"/"+ele);
        if(info.isDirectory()){
            console.log("dir: "+ele);
            readDirSync(path+"/"+ele);
        }else{
            console.log("file: "+ele);
        }
    })
}


async function analysis(file) {
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

function abcd() {
    let ImageSource = getMongoPool('20170427').ImageSource;

    let query = ImageSource.find({},'name');
    query.limit(10);
    query.exec(async function(err, items){

        for(let key in items){
            let item = items[key];
            //console.log(item.name);
            let url = config_calculator.url + '/caculator' + "?date=20170427" + "&image=" + item.name;
            console.log(item.name, url);
            let result = await python(url);

            console.log(result);
        }
    });
}

async function python(url){
    return new Promise((resolve, reject) => {
        request({url: url}, async(err, res1, body) => {
            if (err) {
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

abcd();

// readDirSync('E:\\Workspace\\seeobject\\IntelligentTraffic\\201705-130image12');

