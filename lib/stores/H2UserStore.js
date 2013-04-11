// dependecies
var bcrypt = require('bcrypt')
  , MongoDb = require('mongodb').Db
  , MongoServer = require('mongodb').Server
  , H2User = require('../models/H2User')
  , debug = console.log;

/**
 * H2UserStore
 * Wrapper for creating persistent H2User instances, modifying existing ones,
 *  and validating logins.
 */
function H2UserStore(options, callback) {
	// read configuartion file
	var db = options.db || 'auth_db'
	  , collection = options.collection || 'user_auth_collection'
	  , host = options.ip || '127.0.0.1'
	  , port = options.port || 27017
	  , auto_reconnect = options.auto_reconnect || false
	  , poolSize = options.poolSize || 4
	  , native_parser = options.native_parser || false
	  , self = this;
	  
	callback = callback || function() {};
	  
	this.db_name = db;
	this.collection_name = collection;
	this.collection = null;
	
	this.db = new MongoDb(db, 
		new MongoServer(host, port, { auto_reconnect:auto_reconnect, poolSize:poolSize} ), 
	 	{ native_parser: native_parser } 
	 );
	
	this.db.open(function(err, dbi) {
		if (err)
			throw new Error('Failed to open ' + db);
		self._get_collection(callback);
	});
	
	this._get_collection = function(callback) {
		var self = this;
		if (self.collection)
	    	callback && callback(self.collection);
	    else {
			self.db.collection(self.collection_name, function(err, col) {
				if (err)
					throw new Error('Error getting collection ' + self.db_name + "." + self.collection_name);
				self.collection = col;
				return callback(col);
			});
		}
	};
}

/**
 * Create a new H2User instance and save it to the 
 *   auth database.  No duplicate usernames allowed.
 * @param rec  the json hash:
 *   { 
 *   	username   : 'bobsmith', 
 *   	password   : 'secret',
 *   	fname      : 'Bob',
 *   	lname      : 'Smith',
 *   	bday_month : 1,
 *   	bday_year  : 1985,
 *   	bday_day   : 1,
 *   	email      : 'bob@aol.com'
 *   }
 * @param callback the callback after saving function([err], [data])
 *   [err]  error message or null
 *   [data] is the h2 user record.
 */
H2UserStore.prototype.createUserRecord = function(rec, callback) {
	
	var self = this;
	// execute after verifying uniqueness of username
	var create = function() {
		var h2u = null;
		try {
			h2u = new H2User(rec);
		} catch (err) {
			return callback(err, null);
		}
		
		// insert into db
		self.collection.insert(h2u, {safe:true}, function(err, rec) {
			if (err) {
				return callback(err);
			}
			
			rec = rec[0];
			var r = {
				username:rec._id,
				email:rec.email,
				created:rec.created
			};
			
			return callback(null, r);
		});
	};
	
	this.userNameExists(rec.username, function(err, bool) {
		if (err)
			return callback(err, null);
		if (bool)
			return callback("username is taken", null);
		create();
	});
};

/**
 * Check user login against database.
 * @param cred the credentials hash: 
 *    username : string,
 *    password : string
 * @returns callback will come back with an error and 
 * 	response.
 * 	On valid login: response is 'success'
 *  On invalid: response will return with the failure:
 *  	'username not found'
 *  	'incorrect password'
 */
H2UserStore.prototype.validateLogin = function(cred, callback) {
	if (!cred)
		return callback(excp.param("credentials"));
	
	if (!cred.username)
		return callback(excp.param("username"));
	
	if (!cred.password)
		return callback(excp.param("password"));
	
	this.findUserByUsername(cred.username, function(err, rec) {
		if (err) {
			return callback(err, null);
		}
		
		if (!rec) {
			return callback(null, { status : "username not found" });
		}
		
		var res = bcrypt.compareSync(cred.password, rec.pwhash);
		
		return callback(null, { status : { code : (res ? 1 : 0), message : (res ? "success" : "incorrect password") } } );
	});
};

/**
 * Find a user by username and return the record.
 *  
 */
H2UserStore.prototype.findUserByUsername = function(username, callback) {
	this._get_collection(function(col) {
		col.findOne({_id:username}, function(err, doc) {
			if (err)
				return callback(err, null);
			return callback(null, doc);
		});
	});
};

/**
 * Returns true if the username is take.
 *
 */
H2UserStore.prototype.userNameExists = function(username, callback) {
	if (!username)
		return callback(new Error(excp.param("username")));
	
	this.findUserByUsername(username, function(err, rec) {
		if (err)
			return callback(err, null);
		
		return callback(null, (rec != null));
	});
};


/**
 * H2UserStore Exception messages.
 */
var excp = {
	CODE        : function(c, m) { return "2.1." + c + ":H2UserStore:" + m; },
	config      : function() { return this.CODE(0, "Failed to read config file."); },
	auth_db     : function() { return this.CODE(1, "Cannot get/create user_auth_collection from db."); },
	finduser    : function() { return this.CODE(2, "There was an error retrieving the user."); },
	param       : function(p) { return this.CODE(3, "Missing parameter: " + (p ? p : "")); }
};

exports = module.exports = H2UserStore;
