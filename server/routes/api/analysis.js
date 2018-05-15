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
const request = require('request');
const config_calculator = require('../../config/calculator');

let getMongoPool = require('../../mongo/pool');

class KakouLogic {
    constructor(x, y) {
        this.items = new Map();
    }
    getKakou(kakouid) {
        let self = this;

        return new Promise(async(resolve, reject) => {
            let result = self.items.get(kakouid);

            if (result)
                resolve(result);
            else {
                await self.initItems();

                result = self.items.get(kakouid);
                resolve(result);
            }
        });
    }

    initItems() {
        console.log('initItems');
        let self = this;
        let doc = getMongoPool('config').Kakou;

        return new Promise((resolve, reject) => {
            doc.find({}, function (err, item) {
                if (!err) {
                    item.forEach((value, key) => {
                        self.items.set(value.kakouid, value);
                    });

                    resolve(self.items);
                } else {
                    reject(err);
                }
            });
        });
    }
}

let kkLogic = new KakouLogic();

module.exports = function (router) {

    // PaaS -> 创建分析结果
    router.post('/analysis/info/:date', (req, res, next) => {
        let date = req.params.date;
        let body = req.body;
        let Analysis = getMongoPool(date).Analysis;
        let item = new Analysis();

        item.imageid = new mongoose.Types.ObjectId(body.imageid);
        item.name = body.name;
        item.kakouid = body.kakouid;
        item.vehiclezone = body.vehiclezone;
        // bach mongodb date, ISO
        item.date = moment(body.date + "Z");
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
            if (err) {
                res.json(500, err);
            } else {
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

        let datas = [];

        if (!req.body.begin || !req.body.end) {
            res.json(403, 'Required parameter missing! [begin, end]');
            return;
        }

        let begin = new moment(req.body.begin);
        let end = new moment(req.body.end);

        let pageSize = 8;
        let current = 1;

        pageSize = req.body.pagesize ? req.body.pagesize * 1 : pageSize;
        current = req.body.current ? req.body.current * 1 : current;

        // begin to end
        while (begin <= end) {
            datas.push(begin.format('YYYYMMDD'));
            begin = begin.add(1, 'days');
        }

        console.log('/analysis/search/1 > datas', datas);


        let param = {
            kakouid: {$in: req.body.kakouid},
            vehiclebrand: req.body.vehiclebrand,
            vehiclemodel: req.body.vehiclemodel,
            vehicleyear: req.body.vehicleyear,
            vehiclemaker: req.body.vehiclemaker,
            vehicletype: req.body.vehicletype
        };

        // 去掉无效查询条件
        for (let name in param) {

            if (!req.body.hasOwnProperty(name) || req.body[name].length == 0) {

                delete param[name];
            }
        }

        // for platenumber [?] [*] search
        if (req.body.platenumber) {
            let RegExp = eval("/" + req.body.platenumber.replace("?", ".").replace("*", ".*") + "/");
            param.platenumber = RegExp;
        }

        param.$and = [{date: {$gte: new moment(req.body.begin + "Z")}}, {date: {$lte: new moment(req.body.end + "Z")}}];

        console.log('param', param);


        let asyncfn = [];

        for (let i in datas) {
            let d = datas[i];
            let fn = (callback) => {
                console.log('find in ', d);
                let Analysis = getMongoPool(d).Analysis;
                Analysis.find(param, function (err, item) {
                    callback(err, item);
                });
            };
            asyncfn.push(fn);
        }

        async.parallel(asyncfn,
            async(err, items) => {
                if (err) {
                    res.send(500, err);
                } else {
                    let results = [];
                    let temps = [];
                    for (let i in items) {
                        results = results.concat(items[i]);
                    }
                    for (let i in results) {
                        let item = JSON.parse(JSON.stringify(results[i]));

                        // async call
                        let kakou = await kkLogic.getKakou(item.kakouid);
                        item["address"] = kakou.address;
                        temps.push(item);
                    }

                    let total = temps.length;

                    let result = {
                        total: total,
                        current: current,
                        data: temps.slice((current - 1) * pageSize, current * pageSize)
                    };

                    res.json(200, result);
                }
            });
    });

    // PaaS -> 图像上传
    router.post('/analysis/search/images', (req, res, next) => {
        let date = '19491001';  // 写死的查询用日期

        let ImageSource = getMongoPool(date).ImageSource;
        var form = new multiparty.Form({uploadDir: './public/upload/'});

        form.parse(req, function (err, fields, files) {
            var resolvepath;
            var originalFilename;
            for (var name in files) {
                let item = files[name][0];
                resolvepath = path.resolve(item.path);
                originalFilename = item.originalFilename;
            }

            if (JSON.stringify(files) == "{}") {
                res.send(403, 'Required parameter missing! [image files]');
                return;
            }
            // 显示上传图片信息
            console.log('analysis upload path > ', resolvepath);

            let file = path.resolve(resolvepath);
            fs.readFile(file, function (err, chunk) {
                if (err)
                    return console.error(err);
                let extname = path.extname(originalFilename);

                let image = new ImageSource();
                image.createtime = moment();         // 创建时间
                image.snaptime = moment();           // 拍摄时间
                image.name = uuid.v1() + extname;    // 图像名称
                image.source = chunk;                // 图像数据
                image.state = 0;                     // 新图像
                image.kakouid = "0";                   // 卡口ID

                image.save(function (err, data) {
                    if (err) {
                        res.send(500, err.errmsg);
                    }
                    else {
                        fs.unlink(file, () => {
                        });  // delete image file

                        let url = config_calculator.url + '/caculator' + "?date=" + date + "&image=" + image.name;

                        request({url: url}, async(err, res1, body) => {
                            if (err) {
                                console.log('err', err);
                                res.send(500, err);
                            } else {
                                let results = JSON.parse(body);
                                console.log('request caculator > ', results);
                                // write analysis
                                let Analysis = getMongoPool(date).Analysis;

                                let hasErr = null;

                                for (i in results) {
                                    let result = results[i];

                                    let item = new Analysis();

                                    adapterAnalysis(item, image.name, image.kakouid, result);

                                    let t = await insertAnalysis(item);
                                    if (t.code === 500) {
                                        hasErr = t;
                                    }
                                }

                                if (hasErr) {
                                    res.send(500, hasErr.body);
                                } else {
                                    Analysis.find({'name': image.name}, (err, items) => {
                                        if (err) {
                                            res.send(500, err);
                                        }
                                        else {
                                            res.json(items);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });
        });
    });
}

const adapterAnalysis = (item, name, kakouid, vehicle) => {
    item.name = name;
    item.kakouid = kakouid;
    item.vehiclezone = {
        "x": vehicle['vehicleZone'][0],
        "y": vehicle['vehicleZone'][1],
        "width": vehicle['vehicleZone'][2] - vehicle['vehicleZone'][0],
        "height": vehicle['vehicleZone'][3] - vehicle['vehicleZone'][1]
    };
    // bach mongodb date, ISO
    item.date = moment('1949-10-01 12:00:00' + "Z");
    item.platehasno = 0;
    item.platecolor = '';
    item.platenumber = '';
    item.platetype = '';

    let vehicleTypes = vehicle['vehicleType']['category'].split('_');

    item.vehiclebrand = vehicleTypes[1];
    item.vehiclemodel = vehicleTypes[3];
    item.vehicleyear = vehicleTypes[4];
    item.vehiclemaker = vehicleTypes[2];
    item.vehiclecolor = vehicle['vehicleColor']['category'];
    item.vehiclescore = vehicle['vehicleColor']['score'];
    item.vehicletype = vehicleTypes[0];

    item.vehicleposture = vehicle["vehiclePosture"]['category'] === "车头" ? 0 : 1;

    if (vehicle["vehicleStruct"]) {
        item.withFrontWindowLabelInspection = vehicle["vehicleStruct"]["withFrontWindowLabelInspection"] ? 1 : 0;
        item.withFrontWindowAccessories = vehicle["vehicleStruct"]["withFrontWindowAccessories"] ? 1 : 0;
        item.isTaxi = vehicle["vehicleStruct"]["isTaxi"] ? 1 : 0;
        item.withDriverSafetyBelt = vehicle["vehicleStruct"]["withDriverSafetyBelt"] ? 1 : 0;
        item.withSideSafetyBelt = vehicle["vehicleStruct"]["withSideSafetyBelt"] ? 1 : 0;
        item.withCellPhone = vehicle["vehicleStruct"]["withCellPhone"] ? 1 : 0;
        item.withFrontWindowObjects = vehicle["vehicleStruct"]["withFrontWindowObjects"] ? 1 : 0;
        item.withOtherPeopleOnSideSeat = vehicle["vehicleStruct"]["withOtherPeopleOnSideSeat"] ? 1 : 0;
        item.withSunShieldDown = vehicle["vehicleStruct"]["withSunShieldDown"] ? 1 : 0;
        item.withSkyRoof = vehicle["vehicleStruct"]["withSkyRoof"] ? 1 : 0;
        if (vehicle["vehicleStruct"]["driveSeatZone"]) {
            item.driverSeatZone = {
                "x": vehicle["vehicleStruct"]["driveSeatZone"][0],
                "y": vehicle["vehicleStruct"]["driveSeatZone"][1],
                "width": vehicle["vehicleStruct"]["driveSeatZone"][2] - vehicle["vehicleStruct"]["driveSeatZone"][0],
                "height": vehicle["vehicleStruct"]["driveSeatZone"][3] - vehicle["vehicleStruct"]["driveSeatZone"][1],
                "score": vehicle["vehicleStruct"]["driveSeatZone"][4],
            }
        }
        if (vehicle["vehicleStruct"]["skyRoof"]) {
            item.skyRoof = {
                "x": vehicle["vehicleStruct"]["skyRoof"][0],
                "y": vehicle["vehicleStruct"]["skyRoof"][1],
                "width": vehicle["vehicleStruct"]["skyRoof"][2] - vehicle["vehicleStruct"]["skyRoof"][0],
                "height": vehicle["vehicleStruct"]["skyRoof"][3] - vehicle["vehicleStruct"]["skyRoof"][1],
                "score": vehicle["vehicleStruct"]["skyRoof"][4],
            }
        }
    }

}

const insertAnalysis = async function (item) {
    return new Promise(function (resolve, reject) {
        item.save((err, data) => {
            if (err)
                return reject({code: 500, body: err});
            else {
                resolve({code: 200, body: data});
            }
        });
    });
}