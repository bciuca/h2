var mongoose = require('mongoose');

exports = module.exports = function H2PostStore(options) {
	return mongoose.createConnection('mongodb://' + options.host + '/' + options.db);
};