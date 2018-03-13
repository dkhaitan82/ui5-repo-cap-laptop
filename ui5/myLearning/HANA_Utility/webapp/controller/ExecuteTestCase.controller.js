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
	return Controller.extend("burberry.hana.util.controller.ExecuteTestCase", {
		// ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function() {
					this._loadTestCase();
				}, this),
				onAfterHide: function(evt) {}
			});
		},
		// ============================================================
		// Get services urls
		// ============================================================
		_getResData: function(sProp) {
			var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
			return oBundle.getText(sProp);
		},
		// ============================================================
		// Helper function to load test cases
		// ============================================================
		_loadTestCase: function() {
			var oThis = this;
			var aFilters = [];
			aFilters.push(new Filter("IS_ACTIVE", FilterOperator.EQ, 1));
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var tcModel = new ODataModel(sURL);
			tcModel.read("/TestCase", {
				filters: aFilters,
				success: function(oData, sResponse) {
					oThis._mergeTestCases(oData, oThis);
				},
				error: function(oError) {
					window.console.log(oError);
				}

			});
		},
		// ============================================================
		// Helper function to add results in test case
		// ============================================================
		_mergeTestCases: function(oDBData, oThis) {
			//window.console.log(oDBData);
			var caseData = {};
			caseData.CMD = "";
			caseData.results = [];
			jQuery.each(oDBData.results, function(index1, obj1) {
				var oData = oThis._getBlankCaseObject();
				oData.BUSINESS_AREA = obj1.BUSINESS_AREA;
				oData.TEST_CASE = obj1.TEST_CASE;
				oData.CREATED_ON = obj1.CREATED_ON;
				oData.UPDATED_ON = obj1.UPDATED_ON;
				oData.SQL_CODE = obj1.SQL_CODE;
				oData.TEST_CASE_DESCRIPTION = obj1.TEST_CASE_DESCRIPTION;
				caseData.results.push(oData);
			});
			oThis.getView().setModel(new JSONModel(caseData), "tce");
		},
		// ============================================================
		// Initialize test result object
		// ============================================================
		_getBlankCaseObject: function() {
			var oData = {};
			oData.BUSINESS_AREA = "";
			oData.TEST_CASE = "";
			oData.CREATED_ON = "";
			oData.UPDATED_ON = "";
			oData.SQL_CODE = "";
			oData.COLUMNS = [];
			oData.DATA = [];
			oData.MESSAGE = "";
			oData.RECORD_COUNT = 0;
			oData.RET_CODE = 0;
			oData.RUN_TIME = 0;
			oData.EXEC_STATUS = 0;
			oData.DATE = "";
			oData.TEST_CASE_DESCRIPTION = "";
			return oData;
		},
		// ============================================================
		// Event to execute test case
		// ============================================================
		onExecuteTestCase: function() {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("xsjs.executeTestCase");
			var sCMD = this.getView().getModel("tce").setProperty("/CMD", "");
			var oTableData = this.getView().getModel("tce").getData();
			var oThis = this;
			jQuery.each(oTableData.results, function(index1, oTC) {
				var sCMD = oThis.getView().getModel("tce").getProperty("/CMD");
				if (oTC.EXEC_STATUS === 0 && sCMD === "") {
					oTableData.results[index1].EXEC_STATUS = 1;
					oThis.getView().getModel("tce").setData(oTableData);
					jQuery.ajax({
						url: sURL,
						method: "POST",
						dataType: "json",
						contentType: "application/json",
						data: oTC.SQL_CODE,
						async: true,
						success: function(output) {
							var oModel = new sap.ui.model.json.JSONModel(output);
							var objOutput = oModel.getData();
							oTableData.results[index1].EXEC_STATUS = 2;
							oTableData.results[index1].MESSAGE = objOutput.MESSAGE;
							oTableData.results[index1].RET_CODE = objOutput.RET_CODE;
							oTableData.results[index1].RUN_TIME = objOutput.RUN_TIME;
							oTableData.results[index1].RECORD_COUNT = objOutput.RECORD_COUNT;
							oTableData.results[index1].DATE = objOutput.DATE;
							oTableData.results[index1].COLUMNS = objOutput.COLUMNS;
							oTableData.results[index1].DATA = objOutput.DATA;
							oThis.getView().getModel("tce").setData(oTableData);
							oThis._UpdateTestCase(oTableData.results[index1]);
						},
						error: function(err) {
							oTableData.results[index1].EXEC_STATUS = 2;
							oTableData.results[index1].MESSAGE = err.responseText;
							oTableData.results[index1].RET_CODE = 8;
							oTableData.results[index1].RUN_TIME = 0;
							oTableData.results[index1].RECORD_COUNT = 0;
							oThis.getView().getModel("tce").setData(oTableData);
							oThis._UpdateTestCase(oTableData.results[index1]);
						}
					});
				}
			});

		},
		_UpdateTestCase: function(oTC) {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var tcModel = new ODataModel(sURL);
			var oTableData = this.getView().getModel("tce").getData();
			var oParam = {
				success: function() {},
				error: function(err) {
					window.console.error(JSON.stringify(err));
				}
			};
			var oRec = {};
			oRec.EXEC_DATE = new Date();
			oRec.RUN_TIME = oTC.RUN_TIME;
			oRec.REC_COUNT = oTC.RECORD_COUNT;
			oRec.IS_VALID = oTC.RET_CODE === 8 ? 0 : 1;
			var sPath = "/TestCase(BUSINESS_AREA='" + oTC.BUSINESS_AREA + "',TEST_CASE='" + oTC.TEST_CASE + "')";
			tcModel.update(sPath, oRec, oParam);
		},
		// ============================================================
		// Not used anymore
		// ============================================================
		onStopTestCase: function() {
			this.getView().getModel("tce").setProperty("/CMD", "STOP");
		},
		// ============================================================
		// Download execution results for recon
		// ============================================================
		onDownloadResults: function() {
			var oTableData = this.getView().getModel("tce").getData();
			var oDownloadData = {};
			oDownloadData.results = [];
			jQuery.each(oTableData.results, function(index1, oTC) {
				if (oTC.EXEC_STATUS === 2) {
					oDownloadData.results.push(oTC);
				}
			});
			if (oDownloadData.results.length > 0) {
				var a = window.document.createElement('a');
				a.href = window.URL.createObjectURL(new Blob([JSON.stringify(oDownloadData)], {
					type: 'text/json'
				}));
				a.download = 'TestCaseData.json';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}
		},
		// ============================================================
		// Reset execution status
		// ============================================================
		onResetAll: function() {
			this._loadTestCase();
		},
		// ============================================================
		// Formatter to color the icons based on statuses
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
		// Format execution status icon
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
		// Format return code icon color
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
		// Format run time in seconds and milliseconds
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
		// Test function not used
		// ============================================================
		onTest: function() {
			var oSelectedItems = this.getView().byId("tableTestCase").getSelectedItems();
			var sPath = oSelectedItems[0].oBindingContexts.tce.sPath;
			window.console.log(oSelectedItems[0].oBindingContexts.tce.sPath);
			window.console.log(this.getView().getModel("tce").getProperty(sPath + "/DATA"));
		}

	});
});