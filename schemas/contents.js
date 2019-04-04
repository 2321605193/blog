var mongoose = require("mongoose");

//内容表结构

module.exports = new mongoose.Schema({
    //关联字段  分类ID
    category:{
        type:mongoose.Schema.Types.ObjectId,//类型
        ref:'Category'//引用
    },

    //内容标题
    title:String,

    user:{
        type:mongoose.Schema.Types.ObjectId,//类型
        ref:'User'//引用
    },

    //添加时间
    addTime:{
        type:Date,
        default:new Date()
    },

    //阅读量
    views:{
        type:Number,
        default:0
    },


    //简介
    description:{
        type:String,
        default:''
    },

    //内容

    content:{
        type:String,
        default: ''
    },


    //评论

    comments:{
        type:Array,
        default:[]
    }

});