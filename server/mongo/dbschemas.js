var mongodbconfig = require('../config/mongodb');
var mongoose = require('mongoose');

module.exports = class Schemas{
    constructor(date){
        let uri = mongodbconfig.uri + 'intelligenttraffic_' + date;
        let conn = mongoose.createConnection(uri, mongodbconfig.options);

        conn.then(function(db) {
            console.log("intelligenttraffic mongodb connected!");
        });

        // 原始图片信息
        this.imageSourceSchema = new mongoose.Schema({
            name: {type: String,index: {unique: true, dropDups: true}},       // 图片名称
            state:{type: Number,index: true},       //  状态 0:新图，1:正在计算特征，2：计算特征成功，-1：计算特征失败
            kakouid:{type: String, index: true},    //  卡口ID
            source:Buffer,                          //  原始图像
            snaptime:Date,                          //  抓拍时间
            createtime:Date,                        //  创建时间
            extend:String                           //  扩展字段，放个大字符串
        });

        this.ImageSource = conn.model('ImageSource', this.imageSourceSchema,'imagesource');

        // 车型分析结果
        this.analysisSchema = new mongoose.Schema({
            imageid:{type: mongoose.Schema.Types.ObjectId,index:true},      //  原始图片信息表的ID
            name: {type: String,index: true},                               //  图片名称
            kakouid:{type: String, index: true},                            //  卡口ID
            vehiclezone:Object,                                             //  车辆检测 > 本信息在原图对应的区域

            platehasno:{type: Number,index: true},                          //  车牌识别 > 车牌有无
            platecolor:{type: String,index: true},                          //  车牌识别 > 车牌颜色
            platenumber:String,                                             //  车牌识别 > 车牌号码
            platetype:String,                                               //  车牌识别 > 合拍类型（保留字段）

            vehiclebrand:String,                                            //  车型识别 > 品牌
            vehiclemodel:String,                                            //  车型识别 > 型号
            vehicleyear:String,                                             //  车型识别 > 年款
            vehiclemaker:String,                                            //  车型识别 > 厂家
            vehiclecolor:String,                                            //  车型识别 > 车辆颜色
            vehicletype:String,                                             //  车型识别 > 车辆分类

            driverSideSeatZone:[],                                          //  车辆结构化 > 车窗 > 副驾驶座位区域
            driverSeatZone:[],                                              //  车辆结构化 > 车窗 > 驾驶员座位区域
            frontWindowLabelInspectionZone:[],                              //  车辆结构化 > 车窗 > 车辆前窗检标签区域
            frontWindowAccessoriesZone:[],                                  //  车辆结构化 > 车窗 > 车辆前窗挂件区域
            frontWindowObjectsZone:[],                                      //  车辆结构化 > 车窗 > 车辆前窗摆件区域
            frontWindowSunShield:[],                                        //  车辆结构化 > 车窗 > 车辆前窗遮阳板区域
            SkyRoof:Object,                                                 //  车辆结构化 > 车窗 > 车辆前窗天窗区域
            TaxiFlag:Object,                                                //  车辆结构化 > 车窗 > 出租车标牌区域

            withVehicleSkyRoof:Number,                                      //  车辆结构化 > 检测部分 > 是否有天窗
            withSunShieldDown:Number,                                       //  车辆结构化 > 检测部分 > 是否遮阳板放下
            isTaxiVehicle:Number,                                           //  车辆结构化 > 检测部分 > 是否是出租车
            withOtherPeopleOnSideSeat:Number,                               //  车辆结构化 > 检测部分 > 副驾驶座位是否有人
            withFrontWindowLabelInspection:Number,                          //  车辆结构化 > 检测部分 > 是否有年检标签
            withFrontWindowAccessories:Number,                              //  车辆结构化 > 检测部分 > 是否有挂件
            withFrontWindowObjects:Number,                                  //  车辆结构化 > 检测部分 > 是否有摆件
            withDriverSafetyBelt:Number,                                    //  车辆结构化 > 检测部分 > 是否主驾驶系安全带
            withSideSafetyBelt:Number,                                      //  车辆结构化 > 检测部分 > 是否副驾驶系安全带
            withCellPhone:Number,                                           //  车辆结构化 > 检测部分 > 是否主驾驶打电话

            countofLabelInspection:Number,                                  //  车辆结构化 > 计数部分 > 车辆前窗年检标签数量
            countofWindowObjects:Number,                                    //  车辆结构化 > 计数部分 > 车辆前窗摆件数量
            countofAccessories:Number,                                      //  车辆结构化 > 计数部分 > 车辆前窗挂件数量
            countofSunShield:Number,                                        //  车辆结构化 > 计数部分 > 车辆前窗遮阳板数量
            countofSideSeatZone:Number,                                     //  车辆结构化 > 计数部分 > 车辆副驾驶区域数量
            countofSeatZone:Number,                                         //  车辆结构化 > 计数部分 > 车辆驾驶区域数量

            layoutofLable:Number,                                           //  车辆结构化 > 计数部分 > 标签布局描述

            snaptime:Date,                                                  //  抓拍时间（抓拍时间，用于查询）
            createtime:Date,                                                //  创建时间（计算完成车型信息的时间）
            extend:String                                                   //  扩展字段，放个大字符串
        });
        this.analysisSchema.index({kakouid:1, vehicletype: 1, vehiclebrand:1, vehiclemaker: 1,vehiclemodel:1,vehicleyear:1,vehiclecolor:1  });
        this.Analysis = conn.model('Analysis', this.analysisSchema,'analysis');
    }
}

