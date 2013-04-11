var fs           = require('fs')
  , utils        = require('../utils/H2Utils')
  , debug        = utils.debug
  , config       = JSON.parse(fs.readFileSync("./config.json", "ascii"))
  , H2User       = require('../models/H2User')
  , H2Status     = require('./H2Status')
  , H2PostStore  = require('../stores/H2PostStore')(
  	{ 
  		host : config.content_db.host,
  		db   : config.content_db.db
  	})
  , H2PostModel  = require('../models/H2PostModel')(H2PostStore)
  , logreq       = utils.logreq
  , H2Categories = require('../models/h2categories')
  , H2Like      = require('../models/h2like');



/**
 * Convenience method for setting up API routing.  
 * 	This method is intended to be executed from 
 * 	the main server.js where all other routes 
 * 	have been configured.
 * @param ser The server instance.
 */
exports = module.exports = function H2APIRouter(server, userStore) {
	/**
	 * Get api info, version, etc.
	 * @method GET
	 */
	server.get('/api/info', function(req, res) {
		
		var sts = H2Status.success();
		sts.api = config.version;
		return res.json(sts);
	});

	/**
	 * Test method, return test json response
	 * @method GET
	 */
	server.get('/api/status', function(req, res) {
		

		var sts = H2Status.success();
		sts.api_status = 'alive';
		return res.json(sts);
	});

	/**
	 * Get have to posts collection.
	 * @method GET
	 */
	server.get('/api/haveto/all/*', authenticate, function(req, res) {
		var user = req.path.match(/([^\/]+)$/);

		

		if (!user)
			return res.json({status:{message:'userid required'}});
		debug('get posts for user %s', user);

		return res.json({status:'ok'}); 
	});


	/**
	 * Create haveto post.
	 * @method POST
	 * 
	 * JSON request body:
	 * {
	 *	"user"  : "userid",
	 *	"title" : "My HaveTo Title",
	 *	"desc"  : "A brief description",
	 *	"catid" : "cat_id",
	 *	"loc"   : [22.0000, 100.0000],
	 *	"tags"  : ["eating, something, etc"]
	 * }
	 */
	server.post('/api/haveto/create', authenticate, function(req, res) {
		

		if (!req.body)
			res.json({status:{message:'failed - must provide a body with post.'}});
		
		if (!req.body.user)
			res.json({status:{message:'failed - must provide param: user.'}});

		if (!req.body.title)
			res.json({status:{message:'failed - must provide param: title.'}});

		if (!req.body.catid)
			res.json({status:{message:'failed - must provide param: catid.'}});

		if (!H2Categories.isValidCategory(req.body.catid))
			res.json( { status : { message : 'failed - not a valid catid: ' + req.body.catid } } );

		var posting = new H2PostModel( {
			user    : req.body.user,
			title   : req.body.title,
			desc    : req.body.desc || null,
			catid   : req.body.catid,
			loc     : req.body.loc || null,
			tags    : req.body.tags || null,
			created : Date.now()
		});

		// create the record
		posting.save(function(err) {
			if (err)
				return res.json( { status : { message : 'failed to create post: ' + err } } );
			return res.json( { status : 'ok' } );
		});

	});

	/**
	 * Like a haveto post.
	 * JSON request body:
	 * {
	 *   "pid"  : "havetopostid"
	 * }
	 */
	server.post('api/haveto/like', authenticate, function(req, res) {
		
		res.json({status:'not yet implemented'});
	});


	/**
	 * Hate a haveto post.
	 * JSON request body:
	 * {
	 *   "pid"  : "havetopostid"
	 * }
	 */
	server.post('api/haveto/hate', authenticate, function(req, res) {
		
		res.json({status:'not yet implemented'});
	});


	/**
	 * Get a list of all valid categories.
	 *
	 */
	server.get('/api/haveto/categories', authenticate, function(req, res) {
		
		res.json( { categories : H2Categories.categories() } );
	});

	/**
	 * Test authenticate method
	 * @method GET
	 */
	server.get('/auth', authenticate, function(req, res) {
		
		return res.json({status:'ok'});
	});

	/**
	 * Create an account.
	 * @method POST
	 * JSON request body:
	 *   { 
	 *   	"username"   : "bobsmith", 
	 *   	"password"   : "secret",
	 *   	"email"      : "bob@aol.com"
	 *   }
	 */
	server.post('/api/account/create', function(req, res) {
		

		if (!req.body || Object.keys(req.body).length == 0 )
			return res.json({status:{message:'failed - missing body', code:'9'}});
		
		
		userStore.createUserRecord(req.body, function(err, rec) {
			if (err) {
				return res.json({status:{message:'failed: ' + err, code:'9'}});
			} else {
				return res.json(rec);
			}
		});
	});

	/**
	 * Account Login.
	 * @method POST
	 * Request json body:
	 * {
	 * 		"username" : "bobsmith",
	 * 		"password" : "secret",
	 * }
	 */
	server.post('/api/login', function(req, res) {
		

		userStore.validateLogin(req.body, function(err, result) {
			if (err) {
				return res.json(err);
			}
			if (result.status && result.status.code == 1) {
				req.sessionStore.setUserForSid(req.body.username, req.sessionID);
				return res.json(H2Status.success());
			} else {
				return res.json(H2Status.failed('Incorrect login information.'));
			}
		});
	});
	
	
	server.post('/api/logout', function(req, res) {
		

		return res.send(H2Status.failed());
	});
	

	/**
	 * Test get method.
	 * @method GET
	 */
	server.get('/api/test', function(req, res) {
		
		return res.send('ok');
	});
	
	
	/**
	 * Return error response for all other requests that 
	 * 	have not been defined in this file.
	 */
	server.all('/api/*', function(req, res) {
		

		var msg = 'API request ' + req.url
			      + ' ' + req.method.toUpperCase()
			      + ' is not supported';
		
		return res.send({status:{code:9, message:msg}});
	});
};

/**
 * Middleware for authenticating requests.
 *
 */
function authenticate(req, res, next) {
	req.sessionStore.getUserForSid(req.sessionID, function(err, user) {
		if (err)
			return next(err);
		if (!user)
			return next(new Error('unauthorized access'));
		return next();
	});
};


