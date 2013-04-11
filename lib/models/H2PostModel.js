// get dependencies
var mongo    = require('mongoose')
  , Schema   = mongo.Schema
  , ObjectId = Schema.ObjectId
  , H2Like  = require('./h2like')
  , debug    = require('../utils/H2Utils').debug;
  
var H2PostSchema = new Schema({
  _id         : ObjectId,
  user        : String,
  title       : String,
  description : String,
  category    : String,
  location    : [Number],
  tags        : [String],
  created     : Date,
  likes       : [H2Like]
});  

var H2PostModel = function(connection) {
	return connection.model('H2PostModel', H2PostSchema);
};

// expose H2PostModel
exports = module.exports = H2PostModel;