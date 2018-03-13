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
      jQuery.ajax({
        url:"/TestDB/testDB",
        success:function(oData){
          window.console.log(oData);
        }
      });
      var sURL="http://services.odata.org/V3/Northwind/Northwind.svc";
      var oModel=new ODataModel(sURL);
      oModel.read("/Category",{
        success:function(oData,resp){
          window.console.log(oData);
        }
      });
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
