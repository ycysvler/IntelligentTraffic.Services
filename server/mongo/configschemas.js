var mongodbconfig = require('../config/mongodb');
var mongoose = require('mongoose');

module.exports = class Schemas{
    constructor(){
        let uri = mongodbconfig.uri + 'config';
        let conn = mongoose.createConnection(uri, mongodbconfig.options);

        conn.then(function(db) {
            console.log("config mongodb connected!");
        });

        this.userSchema = new mongoose.Schema({
            userid: {type: String,index: true},     // 用户ID
            mobile: {type: String,index: true},     // 手机号
            password: String,                       // 密码
            entid:{type: String,index: true},       // 企业ID
            createtime:Date                         // 创建时间
        });

        this.User = conn.model('User', this.userSchema);

        this.vehicletypeSchema = new mongoose.Schema({
            vehicletype: {type: String,index: true},    // 车型识别 > 车辆分类
            vehiclebrand: {type: String,index: true},   // 车型识别 > 品牌
            vehiclemaker: {type: String,index: true},   // 车型识别 > 厂家
            vehiclemodel: {type: String,index: true},   // 车型识别 > 型号
            vehicleyear: {type: String,index: true}     // 车型识别 > 年款
        });
        this.vehicletypeSchema.index({ vehicletype: 1, vehiclebrand:1, vehiclemaker: 1,vehiclemodel:1,vehicleyear:1  });
        this.VehicleType = conn.model('VehicleType', this.vehicletypeSchema,'vehicletype');
    }
}

