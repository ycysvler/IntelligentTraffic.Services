/**
 * Created by yanggang on 2017/3/6.
 */
var mysql      = require('mysql');
var mysqlconfig = require('../config/mysql');
var pool  = mysql.createPool(mysqlconfig);
module.exports = pool;
