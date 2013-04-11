var log = console.log;

exports = module.exports = H2Utils;

function H2Utils() {
}

/**
 * Logging utility.  Print request details to stdout.
 * 
 */
H2Utils.logreq = function(req) {
	req = req || { 
		connection : { remoteAddress : 'na' },
		path       : 'na',
		method     : 'na'
	};
	var ip   = req.connection.remoteAddress
  , time = H2Utils.getTimeStamp()
  , path = req.path
  , meth = req.method;

  log(time + '|origin:' + ip + '|' + meth + ':' + path);
};

/**
 * Print args with timestamp and method name where
 *   the debug statement was called from.
 * 
 */
H2Utils.debug = function() {
	var arg = H2Utils.getTimeStamp() + '|' + H2Utils.getStackDebug() + '|';
	var args = [];
	if (arguments.length > 0)
		args[0] = arg + arguments[0];
	else 	
		args[0] = arg;
	for (var i = 1; i < arguments.length; i++) {
		args[i] = arguments[i];
	}
	log.apply(this, args);
};

/**
 * Get stack trace.
 * 
 */
H2Utils.getStack = function() {
	return new Error().stack;
};

/**
 * Get method name, line, anc column number of callee.
 * 
 */
H2Utils.getStackDebug = function() {
	return H2Utils.getStack().split('\n')[4].replace(/(.\sat\s)/, '');
};

/**
 * Return the time in ISO format.
 * 
 */
H2Utils.getTimeStamp = function() {
	return new Date().toISOString();
};
