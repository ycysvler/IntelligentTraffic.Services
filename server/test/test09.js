/*
* 测是时间的写入，UTC时间问题
* */

let getMongoPool = require('../mongo/pool');
let moment = require('moment');
let mongoose = require('mongoose');

let User = getMongoPool('config').User;

function create() {
    let user = new User();
    user.userid = '23';
    user.mobile = '13811107023';
    user.password = 'pwd';
    user.entid = 'test';
    user.createtime = new moment();

    user.save((err,item)=>{
        console.log(item);
    })
}

function show(userid){
    User.findOne({userid:userid}, (err, item)=>{
        console.log(item);
        console.log(moment(item.createtime).format('LLLL'))

    });
}

function timesplt(){
    let begin = new moment('2018-05-26 16:30:00');
    let end = new moment('2018-05-26 17:33:00');

    console.log(begin ,end);
    let param = {
    };
    param.$and = [{createtime: {$gte: begin}}, {createtime: {$lte:end}}];

    User.find(param, (err, items)=>{
        console.log(items);
    })
}

show('26');
timesplt();