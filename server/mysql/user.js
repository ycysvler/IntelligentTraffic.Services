/**
 * Created by yanggang on 2017/3/6.
 */
var crypto = require('crypto');
var pool = require('./pool');

class User  {
    constructor() {
        this.user = null;
    }
    signin(name,password,callback) {
        var sql = 'SELECT * FROM base_user WHERE name = ? AND is_super = 1';
        pool.query(sql, [name], function (error, results, fields) {
            if (error) {
                console.error('error query: ' + error.stack);
                callback(500);
            } else {
                if(results.length == 0) {
                    callback(404);
                } else {
                    this.user = results[0];
                    if(this.user && this.validatePassword(password)) {
                        //validated
                        //删除密码以及salt，token
                        delete this.user.password;
                        delete this.user.salt;
                        delete this.user.token;
                        callback(200)
                    } else {
                        //not match
                        callback(403)
                    }
                }
            }
        }.bind(this));
    }
    validatePassword(password) {
        var genpassword = this.generatePassword(this.user.name, password, this.user.salt);
        return (genpassword == this.user.password)
    }
    generatePassword(username, password, salt) {
        var res = '';
        
        var hash1 = crypto.createHash('sha1');
        hash1.update(username + password);
        res = hash1.digest('hex').toUpperCase();

        var hash2 = crypto.createHash('sha1');
        hash2.update(res + salt);
        res = hash2.digest('hex').toUpperCase();

        return res;
    }
    generateSalt(len) {
        len = len || 6;
        var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var maxPos = $chars.length;
        var pwd = '';
        for (var i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    list(appKey, callback) {
        var sql =  'SELECT `id`,`portal_id`,`name`,`full_name`,`email`,`phone`,`gender`,`avatar`,`is_super`,`is_lock`,`create_time`,`update_time`,`token` ' +
            'FROM base_user WHERE portal_id = (SELECT id FROM app_product WHERE appKey = ?)';

        pool.query(sql,[appKey],function(error, results, fields) {
            if (error) {
                console.error('error query: ' + error.stack);
            } else {
                callback(results);
            }
        }.bind(this))
    }
    createUser(post, callback) {
        var sql = 'INSERT base_user SET ?';
        //设置默认
        post.is_super = 0;
        post.is_lock = 0;
        pool.query(sql, post, function (error, results, fields) {
            if (error) {
                console.error('error query: ' + error.stack);
                callback(false);
            }
            else{
                callback(true);
            }
        }.bind(this));
    }
    modifyUser(post, callback) {
        var sql = 'UPDATE base_user SET ? WHERE id = ?';
        pool.query(sql, [post,post.id], function (error, results, fields) {
            if (error) {
                console.error('error query: ' + error.stack);
                callback(false);
            }
            else{
                callback(true);
            }
        }.bind(this));
    }
    changePassword(appKey, id, name, newPassword, callback) {
        var sql = 'UPDATE base_user SET ? WHERE id = ? AND portal_id = (SELECT id FROM app_product WHERE appKey = ?)';
        //重新生成密码
        var salt = this.generateSalt(5);
        var password = this.generatePassword(name,newPassword,salt);
        var post = {
            password:password,
            salt:salt
        };
        pool.query(sql, [post,id,appKey], function (error, results, fields) {
            if (error) {
                console.error('error query: ' + error.stack);
                callback(false);
            }
            else{
                callback(true);
            }
        }.bind(this));
    }
}

module.exports = User;





