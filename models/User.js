var mongoose = require('mongoose');

var usersSchema = require('../schemas/user');

module.exports = mongoose.model('User',usersSchema);//模型类  用于用户对表结构进行操作