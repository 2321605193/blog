var mongoose = require('mongoose');

var contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Content',contentsSchema);//模型类  用于用户对表结构进行操作