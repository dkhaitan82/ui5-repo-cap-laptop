sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/ODataModel",
   "sap/ui/commons/Image"
], function(Controller, MessageToast, JSONModel, ODataModel) {
	"use strict";
	return Controller.extend("burberry.hana.util.controller.Home", {
	    // ============================================================
		// Initialize                               
		// ============================================================
		onInit: function() {
            /*
            POC to show company logo at title bar
            /*
            var oPage=this.getView().byId("pageHome");
            var oBar = new sap.m.Bar( {
                      contentLeft : [ new sap.ui.commons.Image( {
                      src : "./css/logo1.png",
                      height : "100%"
                 }) ],
                 contentMiddle : [ new sap.m.Label( {
                      text : "HANA Utilities",
                      textAlign : "Left",
                      design : "Bold"
                 }) ],
                 contentRight : []
            });
            oPage.setCustomHeader(oBar);
            */
		},
		// ============================================================
		// Open Jobs Email alert view                               
		// ============================================================
		onGotoJobs: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("jobs");
		},
		// ============================================================
		// Open Virtual Columns view                             
		// ============================================================
		onGotoVC:function(oEvent){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("vc");
		},
		// ============================================================
		// Open SAP Standard Job Admin tool in separate tab                               
		// ============================================================
		onGotoJobDashBoard:function(oEvent){
		   var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
		   var sURL = sOrigin + "/sap/hana/xs/admin/jobs/";
		   window.open( sURL,"_blank");
		},
		// ============================================================
		// NOT Used                               
		// ============================================================
		onGotoJobLog:function(oEvent){
		    MessageToast.show("Dev is in Progress");
		},
		// ============================================================
		// Open main testing view                               
		// ============================================================
		onGotoTesting:function(oEvent){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("testPanel");
		}
	});
});