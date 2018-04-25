/**
 * Created by VLER on 2017/8/8.
 */
let multiparty = require('multiparty');
let moment = require('moment');
let uuid = require('uuid');
var path = require('path');
let fs = require('fs');

let getMongoPool = require('../../mongo/pool');

module.exports = function (router) {

    // PaaS -> 图像上传
    router.post('/images/:date', (req, res, next) => {

        let date = req.params.date;
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

            if(!fields.kakouid || !fields.kakouid[0]){
                res.send(403,'Required parameter missing! [kakouid]');
                return;
            }

            if(!fields.snaptime || !fields.snaptime[0]){
                res.send(403,'Required parameter missing! [snaptime]');
                return;
            }

            if(JSON.stringify(files) == "{}"){
                res.send(403,'Required parameter missing! [image files]');
                return;
            }

            let file = path.resolve(resolvepath);
            fs.readFile(file, function (err, chunk) {
                if (err)
                    return console.error(err);

                let item = new ImageSource();
                item.createtime = new moment();
                item.snaptime = moment(fields.snaptime[0]);
                item.name = originalFilename;
                item.source = chunk;
                item.kakouid = fields.kakouid[0];

                // 如果有类型和扩展信息，那就加上吧
                item.state = 0; //新图像

                item.save(function (err, item) {
                    fs.unlink(file, () => {
                    });

                    if (err) {
                        res.send(500, err);
                    }
                    else {
                        res.send(200, item._id);
                    }
                });
            });

        });
    });

    // PaaS -> 查询 -> 业务信息
    router.get('/images/info/:date/:name', (req, res, next) => {
        // connect 使用 appid 换算出 entid
        let date = req.params.date;
        let name = req.params.name;
        let ImageSource = getMongoPool(date).ImageSource;
        ImageSource.findOne({name: name},'_id name state kakou snaptime createtime', function (err, item) {
            res.json(item);
        });
    });

    // PaaS -> 查询 -> 图片数据
    router.get('/images/data/:date/:name', (req, res, next) => {
        // connect 使用 appid 换算出 entid
        let date = req.params.date;
        let name = req.params.name;
        let ImageSource = getMongoPool(date).ImageSource;

        ImageSource.findOne({name: name}, 'source', function (err, item) {
            if (err) {
                res.send(err);
            } else {
                res.send(item.source);
            }
        });
    });

    // 淘汰接口
    router.put('/images/:name/extend', (req, res, next) => {
        // connect 使用 appid 换算出 entid
        let entid = req.ent.entid;
        let name = req.params.name;
        let extend = req.body.extend;

        /* 待实现 */
        Image.findOneAndUpdate({name: name}, {extend: extend}, function (err, item) {
            res.send(200, true);
        });
    });

    // 淘汰接口
    router.delete('/images/:name', (req, res, next) => {
        // connect 使用 appid 换算出 entid
        let entid = req.ent.entid;
        let name = req.params.name;
        let Image = getMongoPool(entid).Image;
        let ImageIndex = getMongoPool(entid).ImageIndex;

        // 查一下对应的索引，如果存在，state 改成 -1
        ImageIndex.findOneAndUpdate({name: name}, {type: -1}, function (err, item) {
        });

        Image.remove({name: name}, function (err, item) {
            if (err) return handleError(err);
            res.send(200, true);
        });

    });
}
