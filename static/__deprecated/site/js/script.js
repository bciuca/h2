// JavaScript Document

//flkhkjfdhgkjhdfkjghkfjdh

$(function() {
	// log, bind fails in safari
	try {
		var log = console.log.bind(console);
	} catch (error) {
		var log = function(str) { console.log(str) };
	}
	
	
	var API = {
		URL_LOGIN : "http://uhaveto.com:8001/api/login"
	};
	
	// setup login button
	$("#button-login").button();
	
	
	
	function login(un, pw, cb) {
			var json = JSON.stringify({ "username":un, "password":pw });
			post(API.URL_LOGIN, json, cb);
	}
	
	function post(url, data, cb) {
		jQuery.ajax ({
			url: url,
			type: "POST",
			data: data,
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success:cb
		});	
	}
	
	// check whether a textfield has text
	function hasText(textfield) {
		return textfield.length > 0;
	}
	
	// disable a button
	function enableButton(button) {
		button.removeAttr("disabled");
		button.removeClass("ui-state-disabled");
		button.button();	
	}
	
	// enable button
	function disableButton(button) {
		button.attr("disabled", "disabled");
		button.addClass("ui-state-disabled");
		button.button();
	}
	
});

