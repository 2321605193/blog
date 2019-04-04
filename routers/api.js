var express = require('express');
var router = express.Router();
var User = require('../models/User'); //引入user模板
var Content = require('../models/Content'); //引入user模板

const crypto = require("crypto");

//同意返回格式
var responseData;

router.use(function (req,res,next) {
    responseData = {
        code:0, //错误码
        message:'' //错误信息
    }

    next();
});
//用户注册
/*
注册逻辑
1、用户名密码不能为空
2、两次输入密码必须一致

数据库
1、用户名是否被注册
2、插入数据
 */
router.post('/user/register',function (req,res,next) {
   //console.log(req.body);//得到前端传来的数据

    var {username,password,repassword} = req.body;


    //用户名是否为空
    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData); //将对象转成json格式返回给前端
        return;
    }
    if(repassword == ''){
        responseData.code = 2;
        responseData.message = '请再次确认密码'
        res.json(responseData); //将对象转成json格式返回给前端
        return;
    }
    if(repassword != repassword){
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json(responseData); //将对象转成json格式返回给前端
        return;
    }

    //用户名是否已经被注册
    User.findOne({
        username:username
    }).then(function (userInfo) {
        console.log("userInfo"+userInfo);
        if(userInfo){//如果存在，表示数据库存在该记录
            responseData.code = 4;
            responseData.message = '用户名已经被注册';
            res.json(responseData); //将对象转成json格式返回给前端
            return ;
        }

        let md5 = crypto.createHash('md5');
        let newPas = md5.update(password).digest('hex');

            //保存用户信息到数据库
        var user = new User({
            username:username,
            password:newPas
        });
        return user.save();//保存到数据库
    }).then(function (newUserInfo) {
        //console.log(newUserInfo);
        responseData.message = '注册成功，返回登陆';
        res.json(responseData);
    });
});

/***
 * 登录
 */

router.post('/user/login',function (req,res) {
    var {username,password} = req.body;



    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return ;
    }
    let md5 = crypto.createHash('md5');
    let newPas = md5.update(password).digest('hex');
    //查询数据库相同用户名和密码是否存在
    User.findOne({
        username:username,
        password: newPas
    }).then(function (userInfo) {
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return ;
        }
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id:userInfo._id,
            username:userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({//保存cookies
            _id:userInfo._id,
            username:userInfo.username
        }));
        res.json(responseData);
        return ;
    });
});


/**
 * 退出
 * @type {Router|router}
 */

router.get('/user/logout',function (req,res) {
    req.cookies.set('userInfo',null);
    responseData.message = '退出'
    res.json(responseData);
});
/**
 * 获取指定文章所有评论
 */
router.get('/comment',(req,res)=>{
    var contentId = req.query.contentid ||"";

    Content.findOne({
        _id:contentId
    }).then((content)=>{
        responseData.data = content.comments;
        res.json(responseData);
    });
});

/**
 * 评论提交
 * @type {Router|router}
 */
router.post('/comment/post',(req,res)=>{
    var contentId = req.body.contentid ||"";
    var postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        content:req.body.content
    };
    // 查询当前内容的信息

    Content.findOne({
        _id:contentId
    }).then((content)=>{
        content.comments.push(postData);
        return content.save();
    }).then((newContent)=>{
        responseData.data = newContent;
        res.json(responseData);
    });
});

module.exports = router;