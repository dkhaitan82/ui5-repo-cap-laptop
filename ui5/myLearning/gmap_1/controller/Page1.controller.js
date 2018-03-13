sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel"
], function (Controller, MessageToast, JSONModel, ODataModel) {
	"use strict";
	return Controller.extend("dk.sample.controller.Page1", {
		// ============================================================
		// Initialize
		// ============================================================
		onInit: function () {
			google.charts.load('current', {
				'packages': ['geochart'],
				'mapsApiKey': 'AIzaSyCAtGk7zdXtuM6xzsIflk_ZyOl0H0fJnAE'
			});
			var oThis = this;
			google.charts.setOnLoadCallback(function(){
				oThis.data = google.visualization.arrayToDataTable([
					['Country', 'Popularity'],
					['Germany', 200],
					['United States', 300],
					['Brazil', 400],
					['Canada', 500],
					['France', 600],
					['RU', 700],
					['IN',500]
				]);
				oThis.options = {colorAxis: {colors: ['yellow', 'green']}};
				oThis.chart = new google.visualization.GeoChart(oThis.getView().byId("geo_chart_canvas").getDomRef());
				oThis.chart.draw(oThis.data, oThis.options);
			});
		},
		// ============================================================
		// Change Chart Data
		// ============================================================
		onChangeData:function(oEvent){
			var data = google.visualization.arrayToDataTable([
				['Country', 'Popularity'],
				['Germany', 700],
				['United States', 600],
				['Brazil', 100],
				['Canada', 200],
				['France', 100],
				['RU', 50],
				['IN',800]
			]);
			window.console.log(data);
			var options = {colorAxis: {colors: ['yellow', 'green']}};
			var chart=this.chart;
			chart.draw(data, options);
		},
		// ============================================================
		// Change Chart Data
		// ============================================================
		onRevertBack:function(oEvent){
			var chart=this.chart;
			chart.draw(this.data, this.options);
		},
		// ============================================================
		// Open Jobs Email alert view
		// ============================================================
		onNavBack: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
		}
	});
});
