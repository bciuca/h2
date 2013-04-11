var H2SessionStore = require('../lib/stores/H2SessionStore')
  , util = require('util')
  , MongoDb = require('mongodb').Db
  , MongoServer = require('mongodb').Server;

var options = { db:"session_db", collection:"sessions", host:"127.0.0.1", port: 27017 };

var h2sessions = new H2SessionStore(options, function(collection) {
	var sid = 'cCV501ALwHtyAdtRyEI6r5mz.5FR9NTxHI00HUrCledLBB5yUozjAE3Uk5Mq3qoP8Wa8';
	var user = 'bogi';
	
	collection.findOne({_id:sid}, function(err, doc) {
		console.log(doc);
	});
	
});
