sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/v2/ODataModel",
   "sap/m/MessageBox",
   "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History",
	'sap/ui/model/Sorter',
	'burberry/hana/util/controller/ExcelDownloader'
], function(Controller, MessageToast, JSONModel, ODataModel, MessageBox, Filter, FilterOperator, History, Sorter,ExcelDownloader) {
	"use strict";
	return Controller.extend("burberry.hana.util.controller.AfterImageLog", {
	    // ============================================================
		// Initialize                                     
		// ============================================================
		onInit: function() {

		},
		// ============================================================
		// Event function to upload test result in JSON                                     
		// ============================================================
		onUploadAfterImage: function(oEvent) {
			var oThis = this;
			var element = document.createElement('div');
			element.innerHTML = '<input type="file">';
			var fileInput = element.firstChild;

			fileInput.addEventListener('change', function() {
				var file = fileInput.files[0];

				if (file.name.match(/\.(txt|json)$/)) {
					var reader = new FileReader();
					reader.onload = function() {
						//window.console.log(reader.result);
						//var oTestData=JSON.parse(reader.result);
						//oThis.getView().setModel(new JSONModel(oTestData), "ai");
						//oThis.getOwnerComponent().setModel(new JSONModel(oTestData),"cai");
						var oModel = new JSONModel();
						oModel.setJSON(reader.result);
						oThis.getView().setModel(oModel,"ai");
						oThis.getOwnerComponent().setModel(oModel,"cai");
					};
                    reader.onloadstart=function(){
					  oThis.getView().byId("statusTitle").setText("Load Started..");
					  //window.console.log("Load Started");  
					};
					reader.onloadend=function(){
					  oThis.getView().byId("statusTitle").setText(""); 
					};
					reader.onprogress = function(){
					    oThis.getView().byId("statusTitle").setText("Load In Progress..");
					    //window.console.log("Load on Progress");  
					};
                    reader.onerror=function(){
                        oThis.getView().byId("statusTitle").setText("Load Error try again....");
                        //window.console.log("Load Error");
                    };
					reader.readAsText(file);
				} else {
					alert("File not supported, .txt or .json files only");
				}
			});

			fileInput.click();
		},
		// ============================================================
		// Formatter function to get icon in table                                     
		// ============================================================
		formatExecStatusIcon: function(oValue) {
			if (oValue === 0) {
				return "sap-icon://status-inactive";
			} else if (oValue === 1) {
				return "sap-icon://status-in-process";
			} else if (oValue === 2) {
				return "sap-icon://status-completed";
			}
		},
		// ============================================================
		// Format function to color the icon based on status                                     
		// ============================================================
		formatReturnCodeIconColor: function(code, msg) {

			if (code === 0 && msg === "") {
				return "#c2d6d6";
			} else if (code > 0) {
				return "#ff3300";
			} else if (code === 0 && msg !== "") {
				return "#00ff00";
			}
		},
		// ============================================================
		// Format runtime in seconds and milliseconds                                    
		// ============================================================
		formatRumTime: function(oValue) {
			if (oValue > 0) {
				var sSeconds = (Math.floor(oValue / 1000)).toString();
				var sMilli = (oValue - Math.floor(oValue / 1000) * 1000).toString();
				return sSeconds + "s" + sMilli + "ms";
			} else {
				return "0";
			}
		},
		// ============================================================
		// Format execution status color                                     
		// ============================================================
		formatExecStatusIconColor: function(oValue) {
			if (oValue === 0) {
				return "#c2d6d6";
			} else if (oValue === 1) {
				return "#ffff4d";
			} else if (oValue === 2) {
				return "#00ff00";
			}
		},
		formatNote:function(sValue){
		    if(sValue===undefined){
		        return "";
		    }else{
		        return sValue.substring(0,30);
		    }
		},
		// ============================================================
		// Event function while after image table                                     
		// ============================================================
		onAfterImageSelect: function(oEvent) {
            var sPath = oEvent.getParameter("listItem").oBindingContexts.ai.sPath;
            var biData = this.getView().getModel("ai").getProperty(sPath);
            var appModel=this.getOwnerComponent().getModel("app");
            appModel.setProperty("/data/test/tc_data",biData);
            appModel.setProperty("/data/test/tc_data_page_title","After Image Data");
            appModel.setProperty("/data/test/tc_data_type","AFTER");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dataView");
            
		},
		onSearch:function(oEvent){
		    var sQuery = oEvent.getParameter("query");
		    var oFilter = null;
		    if (sQuery){
		        oFilter = new Filter([
		            new Filter("BUSINESS_AREA", FilterOperator.Contains, sQuery),
		            new Filter("TEST_CASE", FilterOperator.Contains, sQuery),
		            new Filter("SQL_CODE", FilterOperator.Contains, sQuery),
		            new Filter("TEST_CASE_DESCRIPTION", FilterOperator.Contains, sQuery) 
		            ],false);
		    }
		    this.getView().byId("tableAfterImage").getBinding("items").filter(oFilter,"Application");
		}
		
	});
});