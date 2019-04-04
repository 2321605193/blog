/*
应用程序启动文件
用户发送http请求 -> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回对应内容至客户端
 */

//加载express
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require("mongoose");
//加载cookies模块
var Cookies = require('cookies');


//加载body-parse,用来处理post提交过来的数据
var bodyParser = require('body-parser');

//创建app应用 相当于http.cereateServer()
var app = express();

var User = require('./models/User');

//设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数  模板引擎名称，也是模板文件后缀，第二个参数表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放目录 第一个参数必须是view 第二个参数是目录
app.set('views','./views');
//注册所使用的模板引擎 第一个参数必须是 view engine 第二个参数必须是和app.engine()所定义的模板引擎名称一致
app.set('view engine','html');

//在开发的过程中，需要取消模板缓存机制
swig.setDefaults({cache:false});


//设置bodyParser
app.use(bodyParser.urlencoded({extended:true}));//在req中增加一个属性body，用户提交的数据存在body中

//设置cookies
app.use(function (req,res,next) {
    req.cookies = new Cookies(req,res);

    //解析用户cookies信息
    req.userInfo={}

    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前用户登录信息
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        }catch (e) {
            next();
        }
    }else {
        next();
    }


});

//根据不同功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));



// /*
// 首页
//   req request对象
//   res response对象
//   next 下一个函数
//  */
// app.get('/',function (req,res,next) { //绑定路由
//     //res.send('<h1>欢迎光临我的博客</h1>');
//     /*
//     读取views目录下的指定文件，解析并返回给客户端
//     第一个参数表示模板文件相对于views目录
//     第二个参数 传递给模板使用的数据
//      */
//     res.render('index');
// });




//监听http请求

mongoose.connect('mongodb://localhost:27017/blog',{ useNewUrlParser: true },function (err) {
    if(err){
        console.log('数据库连接失败 ');
    }else{
        console.log('数据库连接成功');
        app.listen(8081);
    }
});

