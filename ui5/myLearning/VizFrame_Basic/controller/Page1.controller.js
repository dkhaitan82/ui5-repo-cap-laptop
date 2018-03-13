sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/ODataModel"
], function(Controller, MessageToast, JSONModel, ODataModel) {
	"use strict";
	return Controller.extend("dk.sample.controller.Page1", {
	  // ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
                legend: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: true,
                }
			});
			var dataModel = new JSONModel("./data/milk_store.json");
			oVizFrame.setModel(dataModel);
		},
		// ============================================================
		// Open Jobs Email alert view
		// ============================================================
		onNavBack: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
		}
	});
});




