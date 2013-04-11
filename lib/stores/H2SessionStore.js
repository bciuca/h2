// dependencies
var MongoStore = require('connect-mongo')
  , MongoDb = require('mongodb').Db
  , MongoServer = require('mongodb').Server;

function H2SessionStore(options, callback) {	
	this.collection = null;
	
	MongoStore.call(this, options, callback);
}

// inherit from MongoStore
H2SessionStore.prototype.__proto__ = MongoStore.prototype;

H2SessionStore.prototype.set = function(sid, session, callback) {
  try {
    var s = {_id: sid, session: JSON.stringify(session)};
	
    if (session && session.cookie && session.cookie._expires) {
      s.expires = new Date(session.cookie._expires);
    }

    this._get_collection(function(collection) {
      collection.update({_id: sid}, s, {upsert: true, safe: true}, function(err, data) {
        if (err) {
          callback && callback(err);
        } else {
          callback && callback(null);
        }
      });
    });
  } catch (err) {
    callback && callback(err);
  }
};

H2SessionStore.prototype.getUserForSid = function(sid, callback) {
	if (!sid)
		throw new Error('sid parameter required');
	
	callback = callback || function(err, rec) {};
	
	try {
		this.collection.findOne({_id:sid}, function(err, rec) {
			if (err)
				return callback(err, null);
			
			if (!rec)
				return callback(null, null);
				
			var user = JSON.parse(rec.session).auth_user;
			if (rec && user) 
				return callback(null, user);
			return callback(null, null);
		});
	} catch (err) {
		callback(err, null);
	}
};

H2SessionStore.prototype.setUserForSid = function(user, sid, callback) {
	if (!user)
		throw new Error('user parameter required');
	if (!sid)
		throw new Error('sid parameter required');
	
	callback = callback || function(err, rec) {};
	
	try {
		this._get_collection(function(collection) {
			collection.findOne({_id:sid}, function(err, doc) {
				if (err)
					return console.log(err);
				if (!doc)
					return callback("No record found", null);
					
				var s = JSON.parse(doc.session);
				s.auth_user = user;
				collection.update({_id:sid}, {session:JSON.stringify(s)}, {safe:true}, 
				function(err) {
					if (err)
						return callback(err, null);
					return callback(null, true);
				});
			});
		});
	} catch (err) {
		callback(err, null);
	}
};

exports = module.exports = H2SessionStore;