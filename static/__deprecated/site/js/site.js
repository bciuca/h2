// JavaScript Document

//flkhkjfdhgkjhdfkjghkfjdh

$(function() {
	// log, bind fails in safari
	try {
		var log = console.log.bind(console);
	} catch (error) {
		var log = function(str) { console.log(str) };
	}
	
	var APPID      = "fmc";
	var CLIENTID   = "fmc"; 
	var PLATFORM   = "html5";
	var URL_GW     = "http://10.59.20.97/cca-gw/";
	
	var STATUS_OK           = "0000001";
	var SESSION_EXPIRED     = "0002005"; 
	
	var API = {
		URL_LOGIN               : URL_GW + "ua/login",
		URL_SMS_THREAD_HEADERS  : URL_GW + "ua/msg/sms/thread/headers",
		URL_SMS_SEND            : URL_GW + "ua/msg/sms/send",
		URL_SMS_DELETE          : URL_GW + "ua/msg/sms/delete",
		URL_SMS_THREAD          : URL_GW + "ua/msg/sms/thread/",
		URL_MESSAGE_COUNTS      : URL_GW + "ua/msg/sms/msgcounts",
		
		//
		// api calls to gw
		//
		
		/**
		 * Login with credentials and run callback.
		 * @param un:username
		 * @param pw:password
		 * @param cb:callback(data, status, xhr)
		 */
		login: function(un, pw, cb) {
			var json = JSON.stringify({ "name":un, "password":pw, "appid":APPID, "clientid":CLIENTID, "platform":PLATFORM });
			log(json);
			jQuery.post(API.URL_LOGIN, json, cb);
		}
	};
	
	
	window.MessageCountsModel = Backbone.Model.extend(
	{
		defaults : function() {
			return {
				
			}
		},
		
		url : API.URL_MESSAGE_COUNTS,
		
		save : function() {
			
		}
	});
	
	//$("div").remove("#chatsview");
	
	// login model
	window.LoginModel = Backbone.Model.extend({
		defaults : function() {
			return {
				name : this.name,
				password : this.password
			}
		},
		
		name : null,
		
		password : null,
		
		url : API.URL_LOGIN,
		
		// login using Backbone RESTful calls
		login : function() {
			log("logging in");
						
			this.save( { "appid":APPID, "clientid":CLIENTID, "platform":PLATFORM, "spcode":"cca" }, 
				{ 
					// callback error
					error : function() {
						log("Error logging in");
					},
					success : function(mdl, rsp) {
						//log("Success " + JSON.stringify(mdl) + "  " + JSON.stringify(rsp));
					}
				}
			 );
		}
	});
	
	// login view
	window.LoginView = Backbone.View.extend({

		// the DOM element
		el : $("#login"),
		
		// bind events
		events : {
			"click #button-login"  : "login",
			"keydown #login-form" : "validate"
		},
		
		// init view and dependencies
		initialize : function() {
			$("#button-login").button();
			//disableButton($("#button-login"));
			this.model.bind("change", this.modelChanged, this);
			this.model.bind("destroy", this.remove, this);
		},
		
		// login
		login : function(e) {
			this.model.clear();
			
			disableButton($("#button-login"));
			
			this.toggleBadLoginMessage(false);
			
			this.model.set("name", this.getUN());
			this.model.set("password", this.getPW());
			
			log(this.model.get("name"));
			this.model.login();
		},
		
		validate : function(e) {
			if (hasText(this.getUN()) && hasText(this.getPW())) {
				enableButton($("#button-login"));
			} else {
				disableButton($("#button-login"));
			}
		},
		
		getUN : function() {
			return $("#uname").val();
		},
		
		getPW : function() {
			return $("#upassword").val();
		},
		
		toggleBadLoginMessage : function(b) {
			var vis = b === true ? "visible" : "hidden";
			$("#bad-login").css("visibility", vis);
		},
		
		toggleNetworkErrorMessage : function(b) {
			var vis = b === true ? "visible" : "hidden";
			$("#network-error").css("visibility", vis);
		},
		
		modelChanged : function() {
			var self = this;
			
			if (this.model.has("status")) {
				var st = this.model.get("status");
				
				if (st.code == STATUS_OK) {
					log("login success");
					
					// create the sms view
					$(this.el).hide("fade", function() {
						self.clear();
						
						window.showApp();
						
					}, 1000);
				} else {
					this.toggleBadLoginMessage(true);
					$("#uname").effect("highlight", { }, 2000);
					$("#upassword").effect("highlight", { }, 2000);
				}
				
				enableButton($("#button-login"));
			}
		}, 
		
		render : function() {

		},
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			this.model.destroy();
		}
		
	});
	
	
	
	
	
	
	
	
	// SMS header model
	window.Header = Backbone.Model.extend({
		// mark thread as read
		
		defaults : function() {
			return {
				body    : this.body,
				dir     : this.dir,
				mid     : this.mid,
				name    : this.name,
				status  : this.status,
				time    : this.time,
				tn      : this.tn,
				type    : this.type,
				selected: this.selected
			}
		},
		
		body    : null,
		dir     : null,
		mid     : null, 
		name    : null, 
		status  : null, 
		time    : null, 
		tn      : null, 
		type    : null, 
		selected: false,
		
		markAsRead : function() {
			if (this.get("status") != "R")
				this.save( { tn : this.tn, status : "R" } );
		}
	});
	
	
	window.HeaderCollection = Backbone.Collection.extend({
		
		model : Header,
		
		url   : API.URL_SMS_THREAD_HEADERS,
		
		// select header
		select : function(cid)  {
			var sel = this.selectedHeader = this.getByCid(cid);
			
			// if header does not exist return.
			if (!sel) return;
			
			// clear selections
			_.each(this.models, function(mod) { mod.set("selected", false) } );
			
			// set model selected
			sel.set("selected", true);
		},
		
		
		// override Backbone.fetch(options)
		fetch : function(options) {
			
			var self = this;
			
			options = options || {};
			options.error   = function(c, r) { 
				log("error cb coll");
			};
			
			// parse the response and create a collection of header objects
			options.success = function(c, r) {
				// reset current collection				
				self.reset();
				
				if (r.status) {
					if (r.status.code == STATUS_OK) {
						// manually add models to the collection
						if (r.messages && r.messages.hasOwnProperty("length") && r.messages.length > 0) {
							// trigger 'add' event only on last message
							for (var i = 0; i < r.messages.length; i++) {
								var sil = (i != (r.messages.length - 1));
								self.add(r.messages[i], { silent:sil } );
							}
							if (!self.selectedHeader) {
								self.select($.cookie("sms_header_selected"));
							}
						}
						else 
							log("somethings is up dog, yo collection is all jacked up");
					} else if (r.status.code == SESSION_EXPIRED) {
						window.location.href("../index.html")
					}
				}
			};
			
			// call super.fetch(this, options)
			return Backbone.Collection.prototype.fetch.call(this, options);
		}
		
	});
	
	// the header view
	window.HeaderView = Backbone.View.extend({
		el : $("#chat-list"),
		
		initialize : function() {
			this.collection.bind("change", this.modelChanged, this);
			this.collection.bind("add", this.modelChanged, this);
			this.collection.bind("destroy", this.remove, this);
		},
		
		refreshHeaders : function() {
			log("refreshing headers");
			
			this.collection.fetch();
		},
		
		modelChanged : function() {
			this.render();
		}, 
		
		render : function() {
			// clear table
			$(this.el).children().remove();
			
			var m = this.collection.models;
			for (var i = 0; i < m.length; i++) {
				var c = new window.HeaderCellView( { model:m[i], position:(i === 0 ? "first" : i === (m.length - 1) ? "last" : "inner") } );
				c.render();
				$(this.el).append(c.el);
			}
			
			// adjust height of detail
			if ($(".detail").height() < $(".side-bar").height())
				$(".detail").css("height", $(".side-bar").height());
				
			
		},
		
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			this.collection.destroy();
		}
		
		
	});
	
	
	window.HeaderCellView = Backbone.View.extend(
	{
		initialize : function() {
			this.model.bind("change", this.modelChanged, this);
			this.model.bind("destroy", this.remove, this);
			
			this.el = null;
		},
		
		modelChanged : function() {
			//this.selected();
		},
		
		render : function() {
			if (this.el)
				return;
			log("render header cell");
			
			var a = this.model.get("name");
			var b = $.trim(this.model.get("body"));
				
			var res = null;
			var lim = 34;
			if (b.length > lim)
				res = b.substring(0, lim).split(" ").slice(0, -1).join(" ") + "...";
			if (res && res == "...")
				res = b.substring(0,lim) + "...";
			
			res = res || b;
			
			var c = this.el = $("<div class='table-cell-" + this.options.position + "' id='table-cell'><h4>" + a + "</h4><span>" + res + "</span><div>");
			c.bind('click', this.model, this.selectCell);
			
			// doesnt work...
			this.delegateEvents({"click" : "onClickCell"})
			
			this.selected();
		},
		
		onClickCell : function() {
			log("clicked cell");
		},
		
		selectCell : function(e) {
			
			$.cookie("sms_header_selected", e.data.cid);
			
			window.headerViewInstance.collection.select(e.data.cid);
		},
		
		selected : function() {
			if (this.model.get("selected"))
				this.select();
			else
				this.unselect();
		},
		
		select : function() {
			// clear thread view
			if (window.smsThreadView)
				window.smsThreadView.clearThreadView();
			
			// setup reply window
			var tn = this.model.get("tn");
			tn = tn.substring(2, tn.length);
			window.replyWindow.clear();
			window.replyWindow = new window.NewSMSMessageView( {model:(new window.NewSMSMessage( { desttnarray:[tn] } ))} );
			window.replyWindow.show();
			
			$(this.el).addClass("table-cell-" + this.options.position + "-selected");
			$("#senderName").text(this.model.get("name"));
			$("#sendTn").text(this.model.get("tn"));
			
			var tn = this.model.get("tn");
			var _url = API.URL_SMS_THREAD_HEADERS + "/" + tn;
			var col = new window.SMSCollection();
			col.tn = tn;
			
			window.smsThreadView = new window.SMSThreadView( { collection:col } );
		},
		
		unselect : function() {
			$(this.el).removeClass("table-cell-" + this.options.position + "-selected");
		},
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			this.model.destroy();
			this.undelegateEvents();
		}
	});
	
	
	// SMS message data model
	window.SMSMessage = Backbone.Model.extend(
	{
		defaults : function() {
			return {
				body    : this.body,
				dir     : this.dir,
				mid     : this.mid,
				name    : this.name,
				status  : this.status,
				time    : this.time,
				tn      : this.tn,
				type    : this.type
			}
		},
		
		body        : null,
		dir         : null,
		mid         : null, 
		name        : null, 
		status      : null, 
		time        : null, 
		tn          : null, 
		type        : null,
		desttnarray : null,
		
		deleteMessage : function() {
			
		},
		
		sendMessage : function() {
			this.save();
		}
		
	});
	
	
	// collection of sms messages, essentially the sms thread
	window.SMSCollection = Backbone.Collection.extend(
	{
		model : window.SMSMessage,
		
		tn : null,
		
		url : function() {
			if (this.tn)
				this.tn = this.tn.substring(2, this.tn.length);
			var ur = (API.URL_SMS_THREAD + this.tn);
			
			log("use url " + ur);
			return ur;
		},
		
		// override Backbone.fetch(options)
		fetch : function(options) {
			
			var self = this;
			
			log("fetching headers " + options + ", tn=" + this.tn);
			options = options || {};
			options.error   = function(c, r) { 
				log("error cb coll");
			};
			
			
			
			// parse the response and create a collection of sms message objects
			options.success = function(c, r) {
				// reset current collection				
				self.reset();
				
				if (r.status) {
					if (r.status.code == STATUS_OK) {
						// manually add models to the collection
						if (r.messages && r.messages.hasOwnProperty("length") && r.messages.length > 0) {
							// trigger 'add' event only on last message
							for (var i = 0; i < r.messages.length; i++) {
								var sil = (i != (r.messages.length - 1));
								self.add(r.messages[i], { silent:sil } );
							}
						}
						else 
							log("somethings is up dog, yo collection is all jacked up");
					} else if (r.status.code == SESSION_EXPIRED) {
						window.location.href("../index.html")
					}
				}
			};
			
			// call super.fetch(this, options)
			return Backbone.Collection.prototype.fetch.call(this, options);
		}
		
	});
	
	// the single sms message view
	window.SMSView = Backbone.View.extend(
	{
		initialize : function() {
			this.bind("change", this.modelChanged, this);
		},
		
		modelChanged : function() {
			log("smsviewchanged");
			this.render();
		},
		
		render : function() {
			var time = this.model.get("time");
			time = new Date(time).toLocaleString();
			var bdy  = this.model.get("body");
			
			// direction
			var dir = this.model.get("dir") == "I" ? "from" : "to";
			
			var html = 
				"<li class='" + dir + "'>" +
					"<table>" + 
					  "<td>" +
						"<tbody>" +
						  "<tr class='top'>" +
							"<td class='left'></td>" +
							"<td class='middle'></td>" +
							"<td class='right'></td>" +
						  "</tr>" +
						  "<tr class='middle'>" +
							"<td class='left'></td>" +
							"<td class='middle'>" +
							  "<p><span>" + bdy + "</span></p>" +
							"</td>" +
							"<td class='right'></td>" +
						  "</tr>" +
						  "<tr class='bottom'>" +
							"<td class='left'></td>" +
							"<td class='middle'></td>" +
							"<td class='right'></td>" +
						  "</tr>" +
						"</tbody>" +
					  "</td>" +
					  "</table>" +
					  "<table style='clear:both; float:none;'></>"
				  "</li>";
			
			this.el = $(html);
		},
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			this.model.destroy();
		}
	});
	
	// the sms thread view
	window.SMSThreadView = Backbone.View.extend(
	{
		el : $(".sms-thread"),
		
		initialize : function() {
			this.collection.bind("add", this.render, this);
			this.refreshThread();
		},
		
		refreshThread : function() {
			this.collection.fetch();
		},
		
		render : function() {
			log("render thread");
			
			var self = this;
			$(self.el).fadeOut("fast", "linear",
				function() {
					self.clearThreadView();
					var m = self.collection.models;
					for (var i = 0; i < m.length; i++) {
						var c = new window.SMSView( { model:m[i] } );
						c.render();
						$(self.el).append(c.el);
					}
					// pad the area with an empty div
					$(self.el).append($("<li style='height: 30px'></div>"));
					
					$(".detail").css("height", $(self.el).height() + 200);
					$(self.el).fadeIn("fast", "linear");
				}
			);
			
			log("height after thread update" + $(this.el).height());
			
		},
		
		clearThreadView : function() {
			var self = this;
			
			$(self.el).children().remove();
		},
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			this.model.destroy();
		}
	});
	
	
	
	window.NewSMSMessage = Backbone.Model.extend(
	{
		defaults : function() {
			return {
				body    : this.body,
				desttnarray : this.desttnarray
			}
		},
		
		url : API.URL_SMS_SEND,
		
		body        : null,
		desttnarray : null,
		message     : null,
		status      : null,
		smsmax      : null,
		smstotal    : null,
		smsquota    : null,
		smsquotamax : null,
		
		deleteMessage : function() {
			
		},
		
		sendMessage : function() {
			this.save();
		}
		
	});
	
	
	window.NewSMSMessageView = Backbone.View.extend(
	{
		el : $(".message-reply"),
		
		initialize : function() {
			this.model.bind("change", this.render, this);
			
			$("#button-send-sms").button();
			$("#button-send-sms");
		},
		
		events : {
			"click #button-send-sms"  : "send",
		},
		
		render : function() {
			log("reply model changed " + this.model.get("message"));
			
			if (this.model.get("message")) {
				//window.headerViewInstance.selectHeader(this.model.get("message").tn);
				//window.smsThreadView.refreshThread();
				$("#new-sms-message").val("");
				$("#button-send-sms").removeAttr("disabled");
				$("#new-sms-message").removeAttr("disabled");
			}
			
			this.show();
		},
		
		send : function() {
			log("send clicked: " + $("#button-send-sms").attr("disabled"));
			this.model.save({ body : $("#new-sms-message").val() });
			$("#button-send-sms").attr("disabled", "disabled");
			$("#new-sms-message").attr("disabled", "disabled");
		},
		
		show : function() {
			$(this.el).show();
		},
		
		hide : function() {
			$(this.el).hide();
		},
		
		remove : function() {
			$(this.el).remove();
		},
		
		clear : function() {
			log("clear reply model");
			this.model.destroy();
			this.undelegateEvents();
		}
	});
	
	
	
	initialize();
	
	
	function initialize() {
		//$(".main-app").hide();
		
		// create the login window.
		window.App = new LoginView( { model:(new window.LoginModel) } );
		//$(window.App.el).hide();
		
		// create messaging views
		window.headerViewInstance = new HeaderView( { collection: new HeaderCollection() } );
		$("#chatsview").hide();
		window.replyWindow = new window.NewSMSMessageView( { model:new window.NewSMSMessage } );
		window.replyWindow.hide();
		
		// msg counts
		window.msgCounts = new window.MessageCountsModel();
		window.checkStatus = function() {
			log("checkstatus " + this);
			
			//window.msgCounts.bind("change", window.ongetcount, window);
			//window.msgCounts.fetch();
			
			//$.getJSON(API.URL_MESSAGE_COUNTS, function(data, stat, xhr) {
			//	log("received response");
			//})
			
			
			var s = "<script type='text/javascript' src='" + API.URL_MESSAGE_COUNTS + "'></script>";
			$(document).append(s);
			
		};
		
		window.ongetcount = function() {
			if (window.msgCounts.get("status").code == STATUS_OK) {
				window.showApp();
			} else {
				window.login();
			}
		};
		
		window.login = function() {
			$(window.App.el).show();
		};
		
		window.showApp = function() {
			$("#chatsview").show("fade", {}, 300);
			window.headerViewInstance.refreshHeaders();
		};
		//window.checkStatus();	
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

