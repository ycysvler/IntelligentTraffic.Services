/**
 * Created by yanggang on 2017/3/6.
 */
// 自动加载
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var loader = function (loadPath,recursive) {
    if (!loadPath){
        loadPath = path.resolve('routes');
    }
    var walk = function(dir) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function(file) {
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) results = results.concat(walk(file));
            else results.push(file);
        });
        return results;
    };
    var files = [];
    if (!recursive){
        files = fs.readdirSync(loadPath);
    } else {
        files = walk(loadPath);
    }

    for (var i in files){
        var file = '';
        if (!recursive){
            file = path.resolve(loadPath , files[i]);
        } else {
            file = path.resolve(files[i]);
        }
        if (fs.statSync(file).isFile() &&
            path.extname(file).toLowerCase() == '.js' &&
            path.basename(file).substr(0,1) != '.'){
            try {
                require(file)(router);
            } catch(e) {
                throw new Error("Error when loading route file "+file);
            }
        }
    }
    return router;
};

module.exports = loader;
