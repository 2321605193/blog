var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');


var data;
/*
处理通用数据
 */
router.use((req,res,next)=>{
   data={
       userInfo:req.userInfo,
       categories:[]
    }
    Category.find().then((categories)=>{
        //读取分类信息
        data.categories = categories;
        next();

    })
});


/**
 * 首页
 */

router.get('/',function (req,res,next) {


        data.page = Number(req.query.page || 1), //页数
        data.limit = 10, //每页显示条数
        data.pages=0,
        data.count=0,
        data.category=req.query.category || ''


    var where = {}

    if(data.category){
        where.category = data.category;
    }

    Content.where(where).count().then((count)=>{
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count/data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page,1);

        var skip = (data.page-1) * data.limit; //忽略条数.


        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
            addTime:-1
        });

    }).then((contents)=>{

        data.contents = contents;

        res.render("main/index", data); //第二个参数分配模板所使用的数据
    });

});

router.get('/view',function (req,res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id:contentId
    }).then((content)=>{
        content.views++;
        content.save();
        data.content = content;
        res.render('main/view',data);
    });
});

module.exports = router;