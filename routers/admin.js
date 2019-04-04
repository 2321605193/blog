

var express = require('express');
var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function (req,res,next) {
    if(!req.userInfo.isAdmin){
        //如果是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return ;
    }
    next();
});

router.get('/',function(req,res,next){  //后台管理首页
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});

/***
 * 用户管理
 * @type {Router|router}
 */

router.get('/user',function(req,res,next){  //用户管理

    /**
     * 从数据库中读取所有用户数据
     * limit(number) 限制获取的数据条数
     * skip(number) 忽略数据的条数
     *
     */

    var page = Number(req.query.page || 1); //页数

    var limit = 4; //每页显示条数

    var pages;
    User.countDocuments().then(function (count) {
        //console.log(count);

        //计算总页数
        var pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1) * limit; //忽略条数.




        User.find().limit(limit).skip(skip).then(function (users) {
            //console.log(users); //查找数据库 所有记录
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users, //将所有用户信息传给用户列表
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    });




});

/**
 * 分类管理
 * @type {Router|router}
 */
router.get('/category',(req,res,next)=> {

    var page = Number(req.query.page || 1); //页数

    var limit = 4; //每页显示条数

    var pages;
    Category.countDocuments().then(function (count) {
        //console.log(count);

        //计算总页数
        var pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1) * limit; //忽略条数.

/*
sort
1 升序
-1 降序
 */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
            //console.log(categorys); //查找数据库 所有记录
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    });
});

/***
 * 添加分类
 * @type {Router|router}
 */
router.get('/category/add',(req,res,next)=> {
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
});

/**
 * 分类的保存
 * @type {Router|router}
 */

router.post('/category/add',function (req,res,next) {
    //console.log(req.body);
    var name = req.body.name || "";
    if(name == ''){
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:"名称不能为空",
        });
        return ;
    }
    //数据库中是否存在同名
    Category.findOne({
        name:name
    }).then((rs)=>{
        if(rs){ //如果存在
            res.render('admin/message',{
                userInfo:req.userInfo,
                message:'该分类已经存在'
            });
            return Promise.reject();
        }else{
            //保存分类
            return  new Category({
                name:name
            }).save();
        }
    }).then((newCategory)=>{
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'分类添加成功',
            url:'/admin/category'
        });
    });

});
/**
 * 分类修改
 * @type {Router|router}
 */

router.get('/category/edit',(req,res,next)=>{
    //获取要修改分类信息,并以表单的形式展现出来
    var id = req.query.id || '';

    //获取要修改的分类信息
    Category.findOne({
        _id:id
    }).then((category)=>{
        console.log(category)
        if(!category){
            res.render('admin/message',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});


router.post('/category/edit',(req,res)=>{
    //获取要修改分类信息
    var id = req.query.id || '';
    var name = req.body.name || '';

    Category.findOne({
        _id:id
    }).then((category)=>{
        if(!category){
            res.render('admin/message',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            //当用户没有做任何修改提交时
            if(name == category.name){
                res.render('admin/message',{
                    userInfo:req.userInfo,
                    message:'没有修改，若放弃修改请返回',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                //要修改的分类已在数据库中存在
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                });

            }
        }
    }).then((sameCategory)=>{
        if(sameCategory){
            res.render('admin/message',{
                userInfo:req.userInfo,
                message:'数据库中已存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(()=>{
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    });
});

/**
 * 分类删除
 * @type {Router|router}
 */
router.get('/category/delete',(req,res)=>{
    //获取删除id
    var id = req.query.id;
    Category.remove({
        _id:id
    }).then(()=>{
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    });
});


/**
 * 内容首页
 * @type {Router|router}
 */

router.get('/content',(req,res)=>{
    var page = Number(req.query.page || 1); //页数

    var limit = 4; //每页显示条数

    var pages=0;
    Content.countDocuments().then(function (count) {
        //console.log(count);

        //计算总页数
        var pages = Math.ceil(count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1) * limit; //忽略条数.




        Content.find().limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function (contents) {
            //console.log(users); //查找数据库 所有记录
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents, //将所有用户信息传给用户列表
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    });



});

/**
 * 内容添加页面
 * @type {Router|router}
 */

router.get('/content/add',(req,res)=>{
    //读取分类
    Category.find().sort({_id:-1}).then((categories)=>{
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    });
});

router.post('/content/add',(req,res)=>{
    console.log(req.body.category);
    if(req.body.category == ''){
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        });
        return ;
    }
    if(req.body.title == ''){
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'内容标题不能为空'
        });
        return ;
    }

    new Content({
        category: req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content,
        user:req.userInfo._id.toString()
    }).save().then(()=>{
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        });
    });


});

/**
 * 内容修改
 * @type {Router|router}
 */
router.get('/content/edit',(req,res)=>{

    var id = req.query.id || '';
    var categories=[];
    Category.find().sort({_id:1}).then((rs)=>{

        categories = rs;

        return Content.findOne({
            _id:id
        }).populate('category');
    }).then((content)=>{



        if(!content){
            res.render('admin/message',{
                userInfo:req.userInfo,
                message:'该内容不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                categories:categories,
                content:content
            });
        }
    });;


});


/**
 * 内容保存
 * @type {Router|router}
 */
 router.post('/content/edit',(req,res)=>{
     var id = req.query.id || '';

     if(req.body.category == ''){
         res.render('admin/message',{
             userInfo:req.userInfo,
             message:'内容分类不能为空'
         });
         return ;
     }
     if(req.body.title == ''){
         res.render('admin/message',{
             userInfo:req.userInfo,
             message:'内容标题不能为空'
         });
         return ;
     }
     Content.update({
         _id:id
     },{
         category: req.body.category,
         title:req.body.title,
         description:req.body.description,
         content:req.body.content
     }).then(()=>{
         res.render('admin/message',{
             userInfo:req.userInfo,
             message:'修改成功',
             url:'/admin/content/edit?id='+id
         });
     });

 });
/**
 * 内容删除
 * @type {Router|router}
 */
router.get('/content/delete',(req,res)=>{
    //获取删除id
    var id = req.query.id;
    Content.remove({
        _id:id
    }).then(()=>{
        res.render('admin/message',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        });
    });
});


module.exports = router;