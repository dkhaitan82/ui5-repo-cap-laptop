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
	return Controller.extend("burberry.hana.util.controller.DetailVirtualColumn", {
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(this._startView, this),
				onAfterHide: function(evt) {}
			});
		},
		_startView: function() {
			var appModel = this.getOwnerComponent().getModel("app");
			var oVC = appModel.getProperty("/data/vc_detail");
			var oModel = new JSONModel(oVC);
			this.getView().setModel(oModel);
			this.getView().bindElement({
				path: "/"
			});
			this._setErrorStyle(oVC);
		},
		onNavBack: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("checkVC");
		},
		_setErrorStyle: function(oVC) {
		    this._removeAllStyle();
			if (oVC.DATA_TYPE_NAME_BACKUP !== oVC.DATA_TYPE_NAME_SYSTEM) {
				this.getView().byId("lblDataTypeBackup").addStyleClass("VCErrorText");
				this.getView().byId("lblDataTypeSystem").addStyleClass("VCErrorText");
			}
			if (oVC.LENGTH_BACKUP !== oVC.LENGTH_SYSTEM) {
				this.getView().byId("lblLengthBackup").addStyleClass("VCErrorText");
				this.getView().byId("lblLengthSystem").addStyleClass("VCErrorText");
			}
			if (oVC.SCALE_BACKUP !== oVC.SCALE_SYSTEM) {
				this.getView().byId("lblScaleBackup").addStyleClass("VCErrorText");
				this.getView().byId("lblScaleSystem").addStyleClass("VCErrorText");
			}
			if (oVC.GENERATED_ALWAYS_AS_BACKUP !== oVC.GENERATED_ALWAYS_AS_SYSTEM) {
				this.getView().byId("lblGenBackup").addStyleClass("VCErrorText");
				this.getView().byId("lblGenSystem").addStyleClass("VCErrorText");
			}
		},
		_removeAllStyle: function() {
			this.getView().byId("lblDataTypeBackup").removeStyleClass("VCErrorText");
			this.getView().byId("lblDataTypeSystem").removeStyleClass("VCErrorText");
			this.getView().byId("lblLengthBackup").removeStyleClass("VCErrorText");
			this.getView().byId("lblLengthSystem").removeStyleClass("VCErrorText");
			this.getView().byId("lblScaleBackup").removeStyleClass("VCErrorText");
			this.getView().byId("lblScaleSystem").removeStyleClass("VCErrorText");
			this.getView().byId("lblGenBackup").removeStyleClass("VCErrorText");
			this.getView().byId("lblGenSystem").removeStyleClass("VCErrorText");
		}
	});
});