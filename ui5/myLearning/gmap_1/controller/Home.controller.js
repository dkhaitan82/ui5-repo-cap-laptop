sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/ODataModel"
], function (Controller, MessageToast, JSONModel, ODataModel) {
  "use strict";
  return Controller.extend("dk.sample.controller.Home", {
    // ============================================================
    // Initialize
    // ============================================================
    onInit: function () {
      var oHbox = this.getView().byId("map_canvas");
      oHbox.addEventDelegate({
        "onAfterRendering": function () {
          this.map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), {
            zoom: 10,
            center: new google.maps.LatLng(-34.028249, 151.157507)
          });
        }
      }, this);
      this.markers = [];
      var sStylePath = jQuery.sap.getModulePath("dk.sample", "/data/nightStyle.json");
      var oStyleModel=new JSONModel(sStylePath);
      this.getView().setModel(oStyleModel,"style");
    },
    // ============================================================
    // Go to Page 1
    // ============================================================
    onPage1: function (oEvent) {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("page_1");

    },
    // ============================================================
    // Google Maps Marker Demo
    // ============================================================
    onShowMarker: function (oEvent) {
      var map = this.map;
      var pos = {
        lat: -34.028249,
        lng: 151.157507
      };
      //Put map center back to Australia
      map.setCenter(pos);
      var locations = [
        ['Bondi Beach', -33.890542, 151.274856, 4],
        ['Coogee Beach', -33.923036, 151.259052, 5],
        ['Cronulla Beach', -34.028249, 151.157507, 3],
        ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
        ['Maroubra Beach', -33.950198, 151.259302, 1]
      ];

      var marker, i;
      var infowindow = new google.maps.InfoWindow();
      for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i][1], locations[i][2]),
          animation: google.maps.Animation.DROP,
          map: this.map,
          title: locations[i][0]
        });
        google.maps.event.addListener(marker, "click", (function (marker, i) {
          return function () {
            infowindow.setContent(locations[i][0]);
            infowindow.open(this.map, marker);
          }
        })(marker, i));
        this.markers.push(marker);
      }
    },
    // ============================================================
    // Remove Markers 
    // ============================================================
    onRemoveMarker: function (oEvent) {
      var i;
      for (i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
      }
      this.markers = [];
    },
    // ============================================================
    // Google Maps and HTML5 Current Location - Navigation Feature
    // ============================================================
    onCurrentLocation: function (oEvent) {
      var map = this.map;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);
        }, function () {
          window.console.log("Can not position to current location");
        });
      } else {
        window.console.log("Location not available");
      }
    },
    // ============================================================
    // Example with GeoJSON
    // ============================================================
    showKolkata: function (oEvent) {
      var map = this.map;
      map.data.loadGeoJson('/ui5/myLearning/gmap_1/data/Kolkata_geo.json');
      map.setCenter({ lat: 22.567097714644586, lng: 88.35891723632812 });
      map.setZoom(10);

    },
    // ============================================================
    // Remove GeoJSON from Map
    // ============================================================
    hideKolkata: function (oEvent) {
      var map = this.map;
      map.data.forEach(function (feature) {
        map.data.remove(feature);
      });
    },
    // ============================================================
    // Custom Marker Example
    // ============================================================
    showIndiaCities:function(oEvent){
      var map = this.map;
      var oThis = this;
      this.hideKolkata();
      map.setZoom(5);
      map.setCenter({lat:22.53285370752713,lng:78.662109375});
      map.data.loadGeoJson('/ui5/myLearning/gmap_1/data/India_Cities.json');
      map.data.setStyle(function(feature) {
        var population = feature.getProperty('population');
        return {icon: oThis._getCircle(population,"white")};

      });
      map.data.addListener("mouseover",function(event){
        //window.console.log(event.feature.getProperty('population'));
        map.data.revertStyle();
        var population = event.feature.getProperty('population');
        map.data.overrideStyle(event.feature, {icon: oThis._getCircle(population,"black")});
      });
      map.data.addListener('mouseout', function(event) {
        //window.console.log(event.feature.getProperty('population'));
        map.data.revertStyle();
      });

    },
    _getCircle:function(pop,color){
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: .2,
        scale: Math.pow(2, pop) / 2,
        strokeColor: color,
        strokeWeight: 3
      };
    },
    // ============================================================
    // Custom Style example
    // ============================================================
    changeNightStyle:function(oEvent){
      var map=this.map;
      var oModel=this.getView().getModel("style");
      var oStyle = oModel.getData();
      var styledMapType = new google.maps.StyledMapType(oStyle);
      map.mapTypes.set('styled_map', styledMapType);
      map.setMapTypeId('styled_map');
    }
  });
});

