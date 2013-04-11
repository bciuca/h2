/**
 * Set status messages here.
 */
function H2Status() {
	
};

/**
 * Set status message and return the object.
 * @param options hash of options:
 * 	code:number code
 * 	message:string of the message
 */
H2Status.setStatus = function (options) {
	options = options || { code:-1, message:"message not set"};
	return { 
			status : 
				{ 
					code : options.code, 
					message : options.message 
				}
			};
};

/**
 * Return error status with optional message.
 */
H2Status.failed = function(msg) {
	msg = msg || 'error';
	return H2Status.setStatus( { code:0, message:msg });
};

/**
 * Return success message with optional message.
 */
H2Status.success = function(msg) {
	msg = msg || 'success';
	return H2Status.setStatus( { code:1, message:msg });
};

/**
 * Return failure status for accessing an unauthorized resource.
 */
H2Status.auth_required = function() {
	return { code:2, message:'Authorization is required for this resource.' };
};

exports = module.exports = H2Status;
 