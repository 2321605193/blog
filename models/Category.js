var mongoose = require('mongoose');

var categorysSchema = require('../schemas/categorys');

module.exports = mongoose.model('Category',categorysSchema);//模型类  用于用户对表结构进行操作