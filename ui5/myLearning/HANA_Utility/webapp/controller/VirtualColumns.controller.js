sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/odata/ODataModel",
   "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
   "sap/ui/core/routing/History"
], function(Controller, MessageToast, ODataModel) {
	"use strict";
	return Controller.extend("burberry.hana.util.controller.VirtualColumns", {
	    // ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.vc");
			var vcModel = new ODataModel(sURL);
			this.getView().setModel(vcModel, "vc");
		},
		// ============================================================
		// Get url property helper function
		// ============================================================
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		// ============================================================
		// On table item selected
		// ============================================================
		onItemSelected: function(oEvent) {
			var oTable = this.getView().byId("vcTable");
			var oIndex = oTable.getSelectedIndex();
			var oModel = this.getView().getModel("vc");
			if (oIndex >= 0) {
				var oContext = oTable.getContextByIndex(oIndex);
				this.getView().bindElement("vc>" + oContext.getPath());
			}
		},
		// ============================================================
		// Back to Home screen
		// ============================================================
		onNavBack: function(oEvent) {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", {}, true);
			}
		},
		// ============================================================
		// Show download popover
		// ============================================================
		showPopover: function(oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("burberry.hana.util.view.DownloadPopover", this);
				this.getView().addDependent(this._oPopover);
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oPopover.openBy(oButton);
			});
		},
		// ============================================================
		// Hide download popover
		// ============================================================
		onDownloadCancel: function() {
			this._oPopover.close();
		},
		// ============================================================
		// Download data in excel
		// ============================================================
		onDownloadExcel:function(oEvent){
		   var sep = this.getOwnerComponent().getModel("app").getProperty("/data/download_seperator");
		   var format=this.getOwnerComponent().getModel("app").getProperty("/data/download_filetype");
		   var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
		   var sURL = sOrigin + "/development/DKHAITAN/mail1/model/VCDownload.xsjs?format="+format+"&sep="+sep;
		   window.open( sURL,"_blank");
		   this._oPopover.close();
		},
		// ============================================================
		// Download popover, event to select download file type
		// ============================================================
		onSelectFileType:function(oEvent){
		    var fType = this.getOwnerComponent().getModel("app").getProperty("/data/download_filetype");
		    if(fType!="CSV"){
		        this.getOwnerComponent().getModel("app").setProperty("/data/download_enable_seperator",false);
		    }else{
		        this.getOwnerComponent().getModel("app").setProperty("/data/download_enable_seperator",true);
		    }
		},
		// ============================================================
		// Download table data in CSV
		// ============================================================
		onDownloadNativeCSV: function(oEvent) {
			var oTable = this.getView().byId("vcTable");
			var oModel = this.getView().getModel("vc");
			jQuery.sap.require("sap.ui.core.util.Export");
			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
			var oExport = new sap.ui.core.util.Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: this.getOwnerComponent().getModel("app").getProperty("/data/download_seperator")
				}),
				models: oModel,
				rows: {
					path: "/VirtualColumns"
				},
				columns: [
					{
						name: "SchemaName",
						template: {
							content: {
								path: "SCHEMA_NAME"
							}
						}
        },
					{
						name: "Table Name",
						template: {
							content: {
								path: "TABLE_NAME"
							}
						}
                    },
                    {
						name: "Column Name",
						template: {
							content: {
								path: "COLUMN_NAME"
							}
						}
                    },
                    {
						name: "Data Type",
						template: {
							content: {
								path: "DATA_TYPE_NAME"
							}
						}
                    },
                    {
						name: "Length",
						template: {
							content: {
								path: "LENGTH"
							}
						}
                    },
                    {
						name: "Scale",
						template: {
							content: {
								path: "SCALE"
							}
						}
                    },
                    {
						name: "Generated Always as",
						template: {
							content: {
								path: "GENERATED_ALWAYS_AS"
							}
						}
                    },
                    {
						name: "Alter Statement",
						template: {
							content: {
								path: "ALTER_STATEMENT"
							}
						}
                    }
    ]
			});
			oExport.saveFile("vc.csv");
			oExport.generate().done(function(sContent) {
				window.console.log(sContent);
			}).always(function() {
				this.destroy();
			});
			this._oPopover.close();
		},
		// ============================================================
		// Search virtual columns
		// ============================================================
		filterVC:function(oEvent){
			var sQuery = oEvent.getParameter("query");
			var oFilter = null;
			if (sQuery) {
				oFilter = new sap.ui.model.Filter([
		            new sap.ui.model.Filter("SCHEMA_NAME", sap.ui.model.FilterOperator.Contains, sQuery),
		            new sap.ui.model.Filter("TABLE_NAME", sap.ui.model.FilterOperator.Contains, sQuery),
		            new sap.ui.model.Filter("COLUMN_NAME", sap.ui.model.FilterOperator.Contains, sQuery),
		            new sap.ui.model.Filter("GENERATED_ALWAYS_AS", sap.ui.model.FilterOperator.Contains, sQuery)
		            ], false);
				this.getView().byId("vcTable").getBinding("rows").filter(oFilter, "Application");
			} else {
				this.getView().byId("vcTable").getBinding("rows").filter(null, "Application");
			}
		}
	});
});