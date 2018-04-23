/**
 * Created by VLER on 2017/8/26.
 */

let getMongoPool = require('../mongo/pool');

module.exports = (req, res, next) => {
    let Enterprise = getMongoPool("cabase").Enterprise;
    // format ip
    let ip = req.ip.replace('::ffff:', '');

    if (req.ent.ips.includes(ip) || ip === '::1') {
        next();
    } else {
        res.send(405, '非法请求！');
    }
}

