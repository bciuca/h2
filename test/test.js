var connect = require('connect')
    , util = require('util')
    , MongoStore = require("connect-mongo")
    , MongoDb = require('mongodb').Db
    , MongoServer = require('mongodb').Server;



// password database
var auth_db_instance;
var auth_db = new MongoDb('auth_db', new MongoServer("127.0.0.1", 27017,
 {auto_reconnect: false, poolSize: 4}), {native_parser: false});

// Establish connection to db
auth_db.open(function(err, db) {
	if (err)
		console.log(err);
	else {
        	db.collection("user_auth_collection", function(err, col) {
                	auth_db_instance = col;
                	if (err) {
                        	console.log("cannot get/create user_auth_collection from db: " + err);
                	}
        	});
        	console.log("password database connected");
	}
});
