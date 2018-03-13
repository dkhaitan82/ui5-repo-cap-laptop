sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/v2/ODataModel",
   "sap/m/MessageBox",
   "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History",
	'sap/ui/model/Sorter'
], function(Controller, MessageToast, JSONModel, ODataModel, MessageBox, Filter, FilterOperator, History, Sorter) {
	"use strict";
	// ============================================================
	// Initialize
	// ============================================================
	return Controller.extend("burberry.hana.util.controller.LogTestCase", {
		onInit: function() {

		}
	});
});