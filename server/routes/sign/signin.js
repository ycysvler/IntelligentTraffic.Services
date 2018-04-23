let moment = require('moment');
let Redis = require('ioredis');
let uuid = require('uuid');
let path = require('path');
let getMongoPool = require('../../mongo/pool');

module.exports = function (router) {

    // PaaS -> 重建索引 0：全量重建，1：增量重建
    router.post('/signin', (req, res, next) => {
        let User = getMongoPool().User;
        let Enterprise = getMongoPool().Enterprise;

        console.log('body', req.body);

        console.log('type ', typeof req.body);

        User.findOne({mobile: req.body.mobile, password: req.body.password}, (err, user) => {
            if (user) {
                Enterprise.findOne({entid: user.entid}, (err, ent) => {
                    if (ent) {
                        res.json({
                            ent: {appid:ent.appid, entname:ent.entname},
                            user: {mobile:user.mobile}
                        });
                    } else {
                        res.json(404, {error: '应企业不存在！'});
                    }
                });
            } else {
                res.json(404, {error: '用户名或密码不存在！'});
            }
        });






        //sendLogs(res,0);
    });

    router.get('/out', (req, res, next) => {
        //sendLogs(res,0);
    });
}