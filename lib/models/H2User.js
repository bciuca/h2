var DateUtil = require('date-utils')
	, bcrypt = require('bcrypt');

/**
 * H2User 
 *  This is the base user that can be of the types defined
 *    below in the constants.
 */
function H2User(attr)
{
	if (!attr
		|| !attr.username
	    || !attr.password
  	    || !attr.email)
		throw excp.constructor();
		
		// validate attributes
		if (attr.username.length > 60 || attr.username.length == 0)
			throw excp.username();
		
		if (attr.password.length < 8 || attr.password.length > 128)
			throw excp.password();
		
		if (attr.email.length > 128)
			throw excp.email();
		
		/**
		 * Public properties
		 *
		 */
		this._id = attr.username;
		
		// hash password synchronously
		var salt    = bcrypt.genSaltSync(10);  
		this.pwhash = bcrypt.hashSync(attr.password, salt);
		
		this.email = attr.email;
				
		this.created = new Date().getTime();
		
		this.type = attr.type || H2User.STANDARD;
};

/**
 * Class Constants
 *  H2User types
 */
H2User.STANDARD = 'standard';
H2User.INTERNAL = 'internal';
H2User.SUPER    = 'super';

/**
 * Convenience method.
 * Test H2User types against constants.
 */
var isValidType = function(type) {
	var s = type.trim().toLowerCase();
	return s === H2User.STANDARD || s === H2User.INTERNAL || s === H2User.SUPER;
};


/**
 * H2User Exception messages.
 */
var excp = {
	CODE        : function(c, m) { return '2.0.' + c + ':H2User:' + m; },
	constructor : function() { return this.CODE(0, 'required attributes not complete.'); },
	username    : function() { return this.CODE(1, 'invalid username.'); },
	password    : function() { return this.CODE(2, 'invalid password.'); },
	bday        : function() { return this.CODE(3, 'invalid birthday.'); },
	email       : function() { return this.CODE(4, 'invalid email.'); },
	fname       : function() { return this.CODE(5, 'invalid first name.'); },
	lname       : function() { return this.CODE(6, 'invalid last name.'); },
	alias       : function() { return this.CODE(7, 'invalid alias.'); },
	type        : function() { return this.CODE(8, 'invalid type.'); },
};

exports = module.exports = H2User;
