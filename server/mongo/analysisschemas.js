var mongodbconfig = require('../config/mongodb');
var mongoose = require('mongoose');

module.exports = class Schemas{
    constructor(){
        let uri = mongodbconfig.uri + 'analysis';
        let conn = mongoose.createConnection(uri, mongodbconfig.options);

        conn.then(function(db) {
            console.log("analysis mongodb connected!");
        });

        // 车型汇总数据
        this.vehicleSchema = new mongoose.Schema({
            platenumber:{type: String,index: {unique: true, dropDups: true}},   //  车牌识别 > 车牌号码
            platecolor:String,                                                  //  车牌识别 > 车牌颜色
            platetype:String,                                                   //  车牌识别 > 车牌类型（保留字段）

            vehiclebrand:String,                                            //  车型识别 > 品牌
            vehiclemodel:String,                                            //  车型识别 > 型号
            vehicleyear:String,                                             //  车型识别 > 年款
            vehiclemaker:String,                                            //  车型识别 > 厂家
            vehiclecolor:String,                                            //  车型识别 > 车辆颜色
            vehicletype:String,                                             //  车型识别 > 车辆分类
            vehiclescore:Number,                                            //  车型识别 > 车型置信度

            createtime:Date,                                                //  创建时间（计算完成车型信息的时间）
            extend:String                                                   //  扩展字段，放个大字符串
        });
        this.vehicleSchema.index({platenumber:1,vehiclebrand:1,vehiclemodel:1,vehicleyear:1,vehiclemaker:1,vehicletype:1 });
        this.Vehicle = conn.model('Vehicle', this.vehicleSchema,'vehicle');

        // 套牌统计信息
        this.illegallySchema = new mongoose.Schema({
            platenumber:{type: String,index: true},                         //  车牌识别 > 车牌号码
            state:{type: Number,index: true},                               //  状态 0:未处理，1:已处理
            analysisid:{type: String,index: true},                          //  原始分析信息表的ID
            snaptime:Date,                                                  //  抓拍时间
            createtime:Date                                                 //  创建时间（计算完成车型信息的时间）
        });
        //this.illegallySchema.index({platenumber:1,vehiclebrand,vehiclemodel,vehicleyear,vehiclemaker,vehicletype });
        this.Illegally = conn.model('Illegally', this.illegallySchema,'illegally');

        // 车辆出现统计
        this.appearSchema = new mongoose.Schema({
            platenumber:{type: String,index: true},                         //  车牌识别 > 车牌号码
            analysisid:{type: String,index: true},                          //  原始分析信息表的ID
            snaptime:Date,                                                  //  抓拍时间
            createtime:Date                                                 //  创建时间（计算完成车型信息的时间）
        });
        //this.illegallySchema.index({platenumber:1,vehiclebrand,vehiclemodel,vehicleyear,vehiclemaker,vehicletype });
        this.Appear = conn.model('Appear', this.appearSchema,'appear');
    }
}

