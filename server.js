// Setup dependencies
var connect = require('connect')
  , util = require('util')
  , fs = require('fs')
  , express = require('express')
  , H2SessionStore = require('./lib/stores/H2SessionStore')
  , H2UserStore = require('./lib/stores/H2UserStore')
  , H2APIRouter = require('./lib/api/H2APIRouter')
  , port = (process.env.PORT || 80)
  , logreq = require('./lib/utils/H2Utils').logreq;

// Setup Express
var server = express.createServer();

// Read config file
var config = JSON.parse(fs.readFileSync("./config.json", "ascii"));

// setup session and authentication stores
var session_store = new H2SessionStore(config.session_db);
var user_store    = new H2UserStore(config.auth_db);



/**
 * Configure express server middleware.
 */
server.configure(function() {
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(function(req, res, next) {
      logreq(req);
      next();
    });
    server.use(express.methodOverride());
    server.use(express.bodyParser());
    server.use(connect.cookieParser(config.cookie_secret));
    server.use(connect.session({
		cookie : { maxAge: 60000 * 60 } // 1 hour
	  , secret : config.session_secret
	  , store  : session_store
	}));
    server.use(express.static(__dirname + '/static'));
    server.use(server.router);
    H2APIRouter(server, user_store);
});


/**
 * Setup the errors (404, 500)
 */
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
// start listening on port
server.listen(port);


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/**
 * Statics get routed here.
 */
server.get('/', function(req,res) {
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


/**
 * A Route for Creating a 500 Error (Useful to keep around)
 */
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

/**
 * The 404 Route 
 * !!(ALWAYS Keep this as the last route)!!
 */
server.get('/*', function(req, res){
    throw new NotFound;
});

/**
 * Not found method.
 * Gets stack trace and prints it in the response.
 * @param msg
 * @returns
 */
function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

util.debug('Listening on http://127.0.0.1:' + port );
