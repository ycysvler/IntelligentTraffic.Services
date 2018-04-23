/**
 * Created by yanggang on 2017/3/7.
 */
module.exports = function (router) {
    router.route('/')
        .get(function(req, res, next) {
            // res.render('index', {
            //     title: '首页',
            //     name: 'xxx'
            // });
            //没有首页前先转到console/signin
            res.redirect('/admin');
        })
};