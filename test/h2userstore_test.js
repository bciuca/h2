var H2UserStore = require('../lib/stores/H2UserStore')
  , util        = require('util')
  , fs          = require('fs'); 

var config = JSON.parse(fs.readFileSync("../config.json", "ascii")).auth_db;

var h2users = new H2UserStore(config, function(){
	h2users.collection.insert({testdoc:"testing insert"});
});

// run tests after db connects
function onReady() {
	console.log("H2UserStore now connected");
	var o = {
		username   : 'bciuca',
		password   : 'mypasswordisprettyawesomeifyouaskme',
		fname      : 'Bogdan',
		lname      : 'Ciuca',
		bday_year  : 1980,
		bday_month : 3,
		bday_day   : 11,
		alias      : 'Bogi',
		email      : 'ciuca3@yahoo.com',
		metro      : 'SFBAY_CA'
	};
	
	h2users.createUserRecord(o, function(err, user) {
		if (err)
			console.log("create rec error:",err);
		else
			console.log(" created rec " , user);
	});
	
	
	/*h2users.findUserByUsername("bciuca", function(err, rec) {
		if (err)
			return console.log(err);
		
		if (!rec)
			return console.log("not found");
		
		console.log("found it!");
		console.log(rec);
	});
	
	
	h2users.userNameExists(null, function(err, bool) {
		if (err)
			return console.log(err);
		return console.log("username exists: " + bool);
	});
	
	
	h2users.validateLogin({username:"bciucas", password:"mypasswordisprettyawesomeifyouaskme"},
		function(err, res) {
			if (err)
				return console.log("login failed " + err);
				
			return console.log(res);
		}
	);*/
}