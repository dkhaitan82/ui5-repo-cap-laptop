sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel"
	], function(Controller, History, JSONModel) {
	"use strict";

	var CController = Controller.extend("burberry.hana.util.controller.TestMainPanel", {

		onInit: function() {

		},

		onOrientationChange: function(oEvent) {

		},

		onAfterRendering: function() {

		},

		onBeforeRendering: function() {

		},
        // ============================================================
		// Go to test case page
		// ============================================================
		onPressGoToDefineTestCase: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("defineTestCase",{},true);
		},
		// ============================================================
		// Go to test case execution page
		// ============================================================
		onPressGoToExecuteTestCase: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("executeTestCase",{},true);
		},
		// ============================================================
		// Go to test log master
		// ============================================================
		onPressGoToLogTestMaster:function(oEvent){
		    this.byId("testSplitPage").toMaster(this.createId("LogMaster"));
		},
		// ============================================================
		// Go to Main Master
		// ============================================================
		onPressBackMaster1:function(){
		    this.byId("testSplitPage").backMaster();
		},
		// ============================================================
		// Not used
		// ============================================================
		onPressDetailBack: function() {
			this.byId("testSplitPage").backDetail();
		},
        // ============================================================
		// Back to home
		// ============================================================
		onPressMasterBack: function() {
			this.getOwnerComponent().getRouter().navTo("home", null, true);
		},
		// ============================================================
		// Go to calculation view validation screen
		// ============================================================
		onPressGoToCheckCalcViews:function(){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("checkCalcViews",{},true);
		},
		// ============================================================
		// Go to Before Image View
		// ============================================================
		onPressGoToBeforeImage:function(){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("beforeImageView",{},true);
		},
		// ============================================================
		// Go to After Image View
		// ============================================================
		onPressGoToAfterImage:function(){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("afterImageView",{},true);
		},
		// ============================================================
		// Go to Reconcile Page
		// ============================================================
		onPressGoToReconcile:function(){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("reconView",{},true);
		},
		onPressGoToCheckVirtualColumns:function(){
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("checkVC",{},true);
		}

	});

	return CController;

});