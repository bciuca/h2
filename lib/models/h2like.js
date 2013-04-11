
var mongo    = require('mongoose')
  , Schema   = mongo.Schema
  , ObjectId = Schema.ObjectId;

exports = module.exports = H2Like;

var H2Like = new Schema({
	_id    : ObjectId,
	user   : String,
	target : ObjectId
});