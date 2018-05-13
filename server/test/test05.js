/*
 * 刷图片进数据库
 * */

let fs = require('fs');
let getMongoPool = require('../mongo/pool');
let imageDir = 'E:\\Workspace\\seeobject\\IntelligentTraffic\\201705-130image12';
let moment = require('moment');
let kakouMap = new Map();

const insertImages = async function(item){
    return new Promise(function (resolve, reject) {
        item.save((err, data) =>{
            if(err)
                return reject({code:500, body:err});
            else
                resolve({code:200,body:data});
        });
    });
}

fs.readdir(imageDir,async  (err, files) => {
    let i = 0;
    //let kakou = getMongoPool('config').Kakou;

    for(let key in files){
        let file = files[key];
        i++;
        let temp = file.split('-');
        if (temp.length > 1) {
            let time = temp[2].substr(0,4) + '-' + temp[2].substr(4,2) + "-" + temp[2].substr(6,2) + " " +
                temp[2].substr(8,2) + ":" + temp[2].substr(10,2) + ":" + temp[2].substr(12,2);
            let date = temp[2].substr(0,8);

            let ImageSource = getMongoPool(date).ImageSource;

            let chunk = fs.readFileSync(imageDir + "\\" + file );
            let item = new ImageSource();
            item.createtime = new moment();
            item.snaptime = moment(time + "Z");
            item.name = temp[2];
            item.source = chunk;
            item.kakouid = temp[0];
            item.state = 0; //新图像

            let r = await insertImages(item);
            console.log(i, r);


            // fs.readFile(imageDir + "\\" + file,async function (err, chunk) {
            //     if (err)
            //         return console.error(err);
            //
            //     let item = new ImageSource();
            //     item.createtime = new moment();
            //     item.snaptime = moment(time + "Z");
            //     item.name = temp[2];
            //     item.source = chunk;
            //     item.kakouid = temp[0];
            //     item.state = 0; //新图像
            //
            //     let r = await insertImages(item);
            //     console.log(i, r);
            // });


        }
    }

    // if (!kakouMap.has(temp[0])) {
    //     kakouMap.set(temp[0], true);
    //
    //
    //
    //     // let item = new kakou();
    //     //
    //     // item.kakouid = temp[0];
    //     // item.name = temp[0];
    //     // item.address = '大连';
    //     // item.lng = '0';
    //     // item.lat = '0';
    //     // item.type = 0;
    //     // item.createtime = moment();         // 创建时间
    //
    //     // item.save(function (err, item) {
    //     // });
    //
    // }

    // console.log(kakouMap);
    // console.log(kakouMap.size);

});

