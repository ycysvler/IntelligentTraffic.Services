/**
 * Created by yanggang on 2017/3/6.
 */
var path = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var favicon = require('serve-favicon');
var cors = require('cors');
var loader = require('./server/loader');
var Redis = require('ioredis');
var moment = require('moment');
moment.locale('cn');

var rediscfg = require('./server/config/redis');

var redis = new Redis(rediscfg);

// 记录日志
global.logs = [];
// 记录心跳
global.heartbeats = {};
// 记录状态
global.states = {};

var app = express();

redis.subscribe(
    'Log',
    'Feature:BuildFeature',
    'State:StateChange',
    'HeartBeat:TimeChange',
    'Search:ProgressChange',
    'Search:Complete',
    function (err, count) { });


//app.use(compression())
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(session({
    name:'sid.dovelet',
    cookie:{ path: '/', httpOnly: true, maxAge: 1000*60*60*24*10 },
    secret: 'K5EfWMujNTunxFlOfDT3PP7NPLY',
    resave: false,
    saveUninitialized: true
}));

var corsOptionsDelegate = function(req, callback){
    var corsOptions;
    corsOptions = {
        origin: req.headers.origin,
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        credentials: true // Access-Control-Allow-Credentials CORS header. Set to true to pass the header, otherwise it is omitted.
    };
    callback(null, corsOptions); // callback expects two parameters: error and options
};
// 处理跨域
app.use(cors(corsOptionsDelegate));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/sign', loader(path.join(__dirname, './server/routes/sign'), true));

let entloader = require('./server/connect/entloader');
let ipvalidate = require('./server/connect/ipvalidate');
// 处理entid
//app.use(entloader);
// 处理ip白名单
//app.use(ipvalidate);
// paas 相关接口
app.use('/api', loader(path.join(__dirname, './server/routes/api'), true));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/dist', 'index.html'));
});


var PORT = process.env.PORT || 7101;
app.listen(PORT, function() {
    console.log('intelligent traffice services running at localhost:' + PORT);
});

