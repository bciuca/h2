/** 
 * Copyright 2012, haveto, inc.
 * 
 *
 */

// Google maps object
var GMap;

(function() {

    // initialization code here
    $('#search-button').button();
    $('#search-input').focus();

    // expose the map instance
    GMap = new Map();

    // backbone instances
    var h2results = null;
    var h2resultsview = null;

    /**
     * Map Constructor.
     *
     * Google Maps, Autocomplete, and Places.
     */
    function Map() {
        var self = this;

        // SF is 37.7750° N, 122.4183° W
        this.defaultLatLng = new google.maps.LatLng(37.7750,-122.4183);
        this.defaultZoom = 13;

        // map instance object and components
        this.mapoptions = {
            center: this.defaultLatLng,
            zoom: this.defaultZoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // google maps instance
        this.map = new google.maps.Map($('#map_canvas').get(0), this.mapoptions);

        
        
        // map marker hash
        //  key: place.id
        //  val: google.maps.Marker instance
        this.markerArray = {};

        // autocomplete
        this.autocomplete = null;

        // center latlong
        this.latlong = new google.maps.LatLng(this.defaultLatLng.lat(), this.defaultLatLng.lng());

        // info window
        this.infowindow = null;

        google.maps.event.addListener(this.map, 'bounds_changed', onMapReady);

        // private event listener - once map is loaded, init 
        //   objects that need a refernce for the map instance.
        function onMapReady() {
            google.maps.event.clearListeners(self.map, 'bounds_changed');
            google.maps.event.addListener(self.map, 'bounds_changed', onBoundsChanged);
            google.maps.event.addListener(self.map, 'click', function(e) {
                console.log(e.latLng.lat(),e.latLng.lng())
            });
            self.panToCurrentLocation();
            setupAutocomplete();
            
            // init the results view
            h2results = new H2ItemList;
            h2resultsview = new H2ResultsView({collection:h2results});
        };


        // private event listner for bounds changed
        function onBoundsChanged() {
            // set autocomplete bounds when they change
            self.autocomplete.setBounds(self.map.getBounds());
        };

        // private event listener for selected autocomplete result
        function onPlaceSelected() {
            self.clearAllMarkers();
            var place = self.autocomplete.getPlace();
            if (!place.geometry)
                return;
            if (place.geometry.viewport) {
                self.map.fitBounds(place.geometry.viewport);
            } else {
                self.map.setCenter(place.geometry.location);
                self.map.setZoom(17);
            }
            
            var image = new google.maps.MarkerImage(
                place.icon, new google.maps.Size(71, 71),
                new google.maps.Point(0, 0), new google.maps.Point(17, 34),
                new google.maps.Size(35, 35));

            self.infowindow = new google.maps.InfoWindow();
            self.infowindow.setContent(place.name);

            var marker = self.createMapMarker({ 
                location : place.geometry.location, 
                icon : image,
                place : place,
                click : function() {
                    self.infowindow.setContent(place.name);
                    self.infowindow.open(self.map, this);
                    h2results.selectLocation(place.id);
                }
            });

            h2results.push(new H2Item({name:place.name, place:place}));
            self.infowindow.open(self.map, marker);
        };

        // autocomplete instantiation
        function setupAutocomplete() {
            var options = {
              bounds: self.map.getBounds(),
              types: ['establishment', 'geocode']
            };

            self.autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-input'), options);

            // add autocomplete select listener
            google.maps.event.addListener(self.autocomplete, 'place_changed', onPlaceSelected);
        };
    }


    /**
     * Create the pin marker on the map.
     * @param options hash with map and position
     * @return the marker instance
     */
    Map.prototype.createMapMarker = function(options) {
        var marker = new google.maps.Marker({
            map: this.map,
            position: options.location
        });

        // add icon
        if (options.icon) {
            marker.setIcon(options.icon);
            marker.setPosition(options.location);
        }

        // add click listener
        if (options.click)
            google.maps.event.addListener(marker, 'click', options.click);

        // add marker to hash
        if (!this.markerArray)
            this.markerArray = {};

        // use place id as the key
        this.markerArray[options.place.id] = marker;

        return marker;
    };


    /**
     * Create the info window that opens up when a marker is clicked.
     *
     */
    Map.prototype.createInfoWindow = function(options) {
        if (!this.infowindow)
            this.infowindow = new google.maps.InfoWindow();
        var html = _.template($('#info-window-template').html());
        this.infowindow.setContent(html(options.place));
        return this.infowindow;
    };


    /**
     * Remove all markers on the map.
     * 
     */
    Map.prototype.clearAllMarkers = function() {
        h2resultsview.clearAll();

        if (!this.markerArray)
            return this.markerArray = {};

        for (var i in this.markerArray) {
            this.markerArray[i].setMap(null);
        }
    };


    /**
     * Search map by keyword
     * @param val the string to search
     */
    Map.prototype.search = function(val) {
        this.clearAllMarkers();

        // search google maps
        this.searchGoogleMaps(val);
        this.searchHaveto(val);

        // search haveto api here
    };


    /**
     * Search google maps by keyword
     * @param val the string to search
     */
    Map.prototype.searchGoogleMaps = function(val) {
        var self = this;
        var request = {
            bounds: self.map.getBounds(),
            keyword: val
        };

        var service = new google.maps.places.PlacesService(self.map);
        service.search(request, function(results, status) {
            switch (status) {
                case google.maps.places.PlacesServiceStatus.OK:
                    console.log('search here', request.bounds);
                    for (var i = 0; i < results.length; i++) {
                        var place = results[i];

                        //$('.side-bar').append('<p>' + place.name + '</>');
                        h2results.push(new H2Item({name:place.name, place:place}));

                        // add click listener to each marker
                        (function() {
                            var p = results[i];
                            self.createMapMarker({
                                location : p.geometry.location,
                                place : p,
                                click : function() {
                                    self.infowindow = self.createInfoWindow({place:p});
                                    self.infowindow.open(self.map, this);
                                    h2results.selectLocation(p.id);
                                }
                            });
                        })(); 
                    }
                    break;

                case google.maps.places.PlacesServiceStatus.ERROR:
                case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
                case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
                case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
                case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
                case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                default:
                    console.log('error: ' + status);
            }
        });
    };


    /**
     * Search haveto API
     * @param val the string to search
     */
    Map.prototype.searchHaveto = function(val) {
        // TO-DO
    };


    /**
     * Get LatLng of current position using location services.
     * @param complete callback
     */
    Map.prototype.getCurrentLocation = function(complete) {
        if (navigator.geolocation) {
            var c1 = function(pos) {
                var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                return complete(null, loc);
            };
            var e1 = function(err) {
                console.log(err);
                return complete(err, null);
            };

            navigator.geolocation.getCurrentPosition(c1, e1,
                { 
                    enableHighAccuracy : true, 
                    timeout            : 10000, 
                    maximumAge         : 0
                }
            );
        }
    };


    /**
     * Position the map to the center of the current location.
     */
    Map.prototype.panToCurrentLocation = function() {
        var self = this; 
        this.getCurrentLocation(function(err, loc) {
            if (err)
                return console.log('Error getting location.  Code:' + err.code + ': ' + err.message);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': loc}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    console.log('I think you are here: ' + results[0].formatted_address);
                    self.autocomplete.setBounds(self.map.getBounds());
                } else {
                    console.log('failed: ' + status);
                }
            });
            self.map.panTo(loc);
            self.map.setZoom(self.defaultZoom);
        });
    };


    /**
     * Have to item model.
     * 
     */
    var H2Item = Backbone.Model.extend({

        // Default attributes for the H2Item item.
        defaults : function() {
            return {
                name: 'Search haveto!',
                desc: '',
                place: null,
                selected: false
            };
        },

        // Ensure that each item created has `name`.
        initialize : function() {
            if (!this.get("name")) {
               this.set({"name": this.defaults.name});
            }
        },

        // Remove this Todo from *localStorage* and delete its view.
        clear : function() {
            console.log('clear model');
            this.destroy();
        }

    });


    /**
     * Collection of H2Item instances.
     * 
     */
   var H2ItemList = Backbone.Collection.extend({
      // Reference to this collection's model.
      model : H2Item,

      selectedItem : null,

      selected : function() {
         return this.filter(function(item) { return item.get('selected') === true; });
      },

      initialize : function() {
         this.bind('change', this.onchanged, this);
      },

      selectLocation : function(id) {
         this.each(function(item) {
            if (item.get('place').id == id) {
               console.log('set selected');
               item.set('selected', true);
               return;
            }
         });
      },

      onchanged : function(e) {
         var self = this;
         if (e.get('selected') === true) {
            this.selectedItem = e;
            this.each(function(item) {
               if (item.get('selected') === true && item.get('place').id != self.selectedItem.get('place').id) {
                  console.log('set selected false');
                  item.set('selected', false);
               }
            });
         }
      },

      getAll : function() {
         return this.filter(function(item) {if (item) return item;})
      }
   });


    /**
     * View for an H2Item.
     * 
     */
    var H2ItemView = Backbone.View.extend({
      //... is a list tag.
      tagName :  "div",

      // Cache the template function for a single item.
      template: _.template($('#h2item-template').html()),

      events : {
         'click .h2item' : 'clicked'
      },

      // The H2ItemView listens for changes to its model, re-rendering.
      initialize : function() {
         this.model.bind('change', this.render, this);
         this.model.bind('destroy', this.remove, this);
         $(this.el).addClass('h2itemframe');
      },

      // Re-render the titles of the todo item.
      render : function() {
         var e = this.$el.html(this.template({name:this.model.get('name'), vicinity:this.model.get('place').vicinity}));
         if (this.model.get('selected') === true)
            $(e).addClass('h2item_selected');
         else
            $(e).removeClass('h2item_selected');

         // set the element id to the place.id property
         $(this.el).attr('id', this.model.get('place').id);
         return this;
      },

      clicked : function() {
         var place = this.model.get('place');
         var iw = GMap.createInfoWindow({place:place});
         iw.open(GMap.map, GMap.markerArray[place.id]);
         console.log('click: set selected');
         this.model.set('selected', true);
      },

      // Remove the item, destroy the model.
      clear : function() {
        console.log('clear itemview');
        this.model.clear();
      },

      // remove the element from the DOM
      remove : function() {
          $(this.el).remove();
          return this;
      }
    });

    /**
     * The results/collection view.
     * 
     */
   var H2ResultsView = Backbone.View.extend({
        // Instead of generating a new element, bind to the existing skeleton
      el : $("#h2results"),

      // view hash collection
      views : {

      },

      // At initialization we bind to the relevant events on the Items
      // collection, when items are added or changed
      initialize : function() {
         h2results.bind('add', this.addOne, this);
         h2results.bind('reset', this.addAll, this);
         h2results.bind('all', this.render, this);
      },

      render : function(e) {
         /*var sid;
         var sel;
         this.collection.each(function(i) {
            if (i.get('selected') === true)
               sid = i.get('place').id;
         });

         if (!sid)
            return;

         _.each(this.$el.children(), function(i) {
            if ($(i).attr('id') === sid)
               sel = $(i);
         });

         console.log(e, sid, sel);*/
         //var sid = this.collection.selected().get('place').id;
         //console.log('selected view is ' + sid);
         console.log(this.collection.selected());
      },

      // Add a single todo item to the list by creating a view for it, and
      // appending its element to the `<div>`.
      addOne : function(h2item) {
         var view = new H2ItemView( { model : h2item } );
         this.$el.append(view.render().el);
         this.views[h2item.get('place').id] = view.el;
      },

      // Add all items in the **Todos** collection at once.
      addAll : function() {
         this.views = { };
         h2results.each(this.addOne);
      },

      clearAll : function() {
         console.log('clearall');
         _.each(h2results.getAll(), function(item) { item.clear(); });
      }
   });


   function isElementInView(el, view) {
       var parentViewTop = $(view).scrollTop();
       var parentViewBot = parentViewTop + $(view).height();

       var elTop = $(el).offset().top;
       var elBot = elTop + $(el).height();

       return ((elBot < parentViewBot) && (elTop > parentViewTop));
   }

}).call(this);