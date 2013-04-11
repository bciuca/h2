/**
 * Server to run in windows.
 *
 * Barebones and only serves up statics, no API support.
 *
 */

// Setup dependencies
var connect = require('connect')
  , util = require('util')
  , express = require('express')
  , port = (process.env.PORT || 80)
  , logreq = require('./lib/utils/H2Utils').logreq;

// Setup Express
var server = express.createServer();
 console.log(logreq);

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
    server.use(express.static(__dirname + '/static'));
    server.use(server.router);
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
  console.log('404');
    throw new NotFound;
});

/**
 * Not found method.
 * Gets stack trace and prints it in the response.
 * @param msg
 * @returns
 */
function NotFound(msg){
  console.log('not found');
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

util.debug('Listening on http://127.0.0.1:' + port );
