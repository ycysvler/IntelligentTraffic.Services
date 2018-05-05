const request = require('request');
const config_calculator = require('../config/calculator');
const config_ftp = require('../config/ftp');
const client = require('ftp');
const fs = require('fs');

let ftp = new client();

ftp.on('ready',()=>{
    console.log('ftp ready');

    ftp.list((err, list)=>{
        list.forEach((item,index)=>{
            console.log(item);

            if(item.type === '-'){
                c.get(item.name,(err,stream)=>{
                    stream.once('close',()=>{c.end();});

                    stream.pipe(fs.createWriteStream(item.name));
                });
            }
        })
    })
});

ftp.connect(config_ftp);

let url = config_calculator.url + '/calculator' + "?image=23.jpg";

request({url:url,gzip:true}, (err, res, body)=>{
    if(err){
        console.log('err',err);
    }else{
        console.log(JSON.parse(body));
    }

});