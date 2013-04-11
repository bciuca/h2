// JavaScript Document

$(function(){
	
	// setup logging shortcut --- log("log message here");
	try {
		var log = console.log.bind(console);
	} catch (error) {
		var log = function(str) { console.log(str) };
	}
	
	var App = {};
	App.left = $(".main-left").width() + 8;
	App.right = $(".main-right").width() + 8;
	App.photoframeWidth = $(".photo-frame").width();
	
	App.photoRows = function() {
		return Math.floor(App.left / App.photoframeWidth) * 2;
	};
	
	App.frameWidthForNum = function(num) {
		return App.photoframeWidth * num;
	};
	
	/*$(window).resize(function(e) {
		var w = $(e.currentTarget).width();
		log(w + "   rows =" + App.photoRows() + "   framewidth=" + App.frameWidthForNum(App.photoRows()));
		
		if (w >= (App.frameWidthForNum(App.photoRows() + 1) + 550)) {
			var nw = App.frameWidthForNum(App.photoRows() + 1) + 550;
			$(".container").width(nw);
			log("new width=" + nw);
		}
	});*/
	
	
});