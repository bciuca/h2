// JavaScript Document

$(function(){
	
	// setup logging shortcut --- log("log message here");
	try {
		var log = console.log.bind(console);
	} catch (error) {
		var log = function(str) { console.log(str) };
	}
	
	var domain = 'http://api.uhaveto.com/'

	var API = {
		URL_LOGIN          : domain + 'api/login',
		URL_ACCOUNT_CREATE : domain + 'api/account/create'
	};
	
	
	$("#login-button").click(function() {
		var user = $('#username').val();
		var pw   = $('#password').val();
		var req  = { username:user, password:pw };
		var err = null;
		
		try {
			login(user, pw, function(data, err) {
				if (!data) {
					err = 'Could not log you in.  Please try again later.';
				} else if (data.status && data.status.code != 1) {
					err = 'Invalid login.  Try again.';
				}
				
				if (err) {
					$('#login-error').css('visibility', 'visible');
					$('#login-error').text(err);
					return;
				}
				
				$('#login-error').css('visibility', 'hidden');
			});
		} catch (err) {
			log('exception caught ', err);
			$('#login-error').css('visibility', 'visible');
			$('#login-error').text(err);
		}
	});
	
	$('#signup-button').click(function() {
		var un = $('#new-username').val();
		var em = $('#new-email').val();
		var pw = $('#new-password').val();
		var err = null;
		
		try {
			createAccount({username:un, email:em, password:pw}, function(data, err) {
				if (!data) {
					err = 'Could not create account at this time.  Please try again later.';
				} else if (data.status && data.status.code != 1) {
					err = data.status.message;
				}
				
				if (err) {
					$('#signup-error').css('visibility', 'visible');
					$('#signup-error').text(err);
					return;
				}
				
				$('#signup-error').css('visibility', 'hidden');
			});
		} catch (err) {
			$('#signup-error').css('visibility', 'visible');
			$('#signup-error').text(err);
		}
	});
	
	
	
	function login(un, pw, cb) {
		var json = JSON.stringify({ "username":un, "password":pw });
		log(json);
		post(API.URL_LOGIN, json, cb);
	}
	
	function createAccount(options, cb) {
		var json = JSON.stringify(options);
		log(json);
		post(API.URL_ACCOUNT_CREATE, json, cb);
	}
	
	
	function post(url, data, cb) {
		jQuery.ajax ({
			url: url,
			type: "POST",
			data: data,
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success:cb
		})
		.fail(function(err) { log(cb); cb(null, err); });	
	}
});