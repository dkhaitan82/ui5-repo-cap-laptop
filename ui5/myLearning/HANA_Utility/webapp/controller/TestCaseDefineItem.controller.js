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
	return Controller.extend("burberry.hana.util.controller.TestCaseDefineItem", {
	    // ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(this._startView, this),
				onAfterHide: function(evt) {}
			});

		},
		// ============================================================
		// Helper Function to get resources                                       
		// ============================================================		
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		// ============================================================
		// Helper function to initialize UI
		// ============================================================
		_initialUiSettings: function() {
			var oViewData = {
				ENABLE_SAVE: false,
				MESSAGE: "",
				MESSAGE_TYPE: "",
				SHOW_MESSAGE: false,
				ENABLE_BUS: true,
				ENABLE_TC: true,
				SHOW_BUS_SELECT: (this._getCurrentContext() === ""),
				SHOW_BUS_INPUT: (this._getCurrentContext() !== "")
			};
			return oViewData;
		},
		// ============================================================
		// Get context for selected test case
		// ============================================================
		_getCurrentContext: function() {
			var oComponentUiModel = this.getOwnerComponent().getModel("app");
			var sTestCaseContext = oComponentUiModel.getProperty("/data/test/item_path");
			return sTestCaseContext;
		},
		// ============================================================
		// Helper function to start the view
		// ============================================================
		_startView: function(evt) {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var oTestCaseModel = new ODataModel(sURL);
			var oViewUiModel = new JSONModel(this._initialUiSettings());
			this._setStatusNone();
			this.getView().setModel(oViewUiModel, "ui");
			this._selectBusinessArea();
			if (this._getCurrentContext() === "") {
				this.getView().byId("ipBusinessArea").setValue("");
				this.getView().byId("ipTestCase").setValue("");
				this.getView().byId("ipNote").setValue("");
				this.getView().byId("ipSQL").setValue("");
			} else {
				oViewUiModel.setProperty("/ENABLE_BUS", false);
				oViewUiModel.setProperty("/ENABLE_TC", false);
				this.getView().setModel(oTestCaseModel, "tc");
				this.getView().bindElement({
					path: this._getCurrentContext(),
					model: "tc"
				});
			}

		},
		// ============================================================
		// Select Unique Business area 
		// ============================================================
		_selectBusinessArea: function() {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var oModel = new ODataModel(sURL);
			var sPath = "/TestCase";
			oModel.read(sPath, {
				success: jQuery.proxy(function(oData, response) {
					var aBus = [];
					var oBus = {};
					oBus.data = [];
					oBus.data.push({
							NAME: "--SELECT--"
						});
					jQuery.each(oData.results, function(indx, obj) {
					    if(aBus.indexOf(obj.BUSINESS_AREA)===-1){
					        aBus.push(obj.BUSINESS_AREA);
						    oBus.data.push({NAME: obj.BUSINESS_AREA});
					    }
					});
					oBus.data.push({
							NAME: "--NEW--"
						});
					this.getView().setModel(new JSONModel(oBus), "sug");

				}, this),
				error: function(msg) {
					window.console.log(JSON.stringify(msg));
				}
			});
			
		},
		// ============================================================
		// Business area drop down event
		// ============================================================
		onChangeBusinessArea:function(oEvent){
		   if(this._getCurrentContext()===""){
		       this.getView().getModel("ui").setProperty("/SHOW_BUS_SELECT", false);
		       this.getView().getModel("ui").setProperty("/SHOW_BUS_INPUT", true);
		       if(oEvent.getSource().getSelectedKey()!=="--NEW--"){
		           this.getView().byId("ipBusinessArea").setValue(oEvent.getSource().getSelectedKey());
		       }
		   } 
		},
		// ============================================================
		// Create new - refresh all inputs
		// ============================================================
		onCreateTestCase: function(oEvent) {
		    var oComponentUiModel = this.getOwnerComponent().getModel("app");
			var sTestCaseContext = oComponentUiModel.setProperty("/data/test/item_path","");
		    this._startView();
			
		},
		// ============================================================
		// Navigate back to test case table
		// ============================================================
		onNavBack: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("defineTestCase");
		},
		// ============================================================
		// Set status for validation error
		// ============================================================
		_setErrorStatus:function(sID,sMessage){
		    var oControl=this.getView().byId(sID);
		    oControl.setValueState("Error");
		    oControl.setValueStateText(sMessage);
		},
		// ============================================================
		// reset status for validation error
		// ============================================================
		_setStatusNone:function(){
		    this.getView().byId("ipSQL").setValueState("None");
		    this.getView().byId("ipBusinessArea").setValueState("None");
		    this.getView().byId("ipTestCase").setValueState("None");
		    this.getView().byId("ipNote").setValueState("None");
		},
		// ============================================================
		// Save changes
		// ============================================================
		onSaveTestCase: function(oEvent) {
		    var iRet=0;
		    this._setStatusNone();
			var oSQL = this.getView().byId("ipSQL").getValue();
			var oBody = {};
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("xsjs.executeTestCase");
			if(oSQL.length===0){
			    iRet = 8;
			    this._setErrorStatus("ipSQL","Please enter SQL code");
			}
			if(this.getView().byId("ipBusinessArea").getValue().length<3){
			    iRet=8;
			    this._setErrorStatus("ipBusinessArea","Missing Business Area(min 3 char)");
			}
			if(this.getView().byId("ipTestCase").getValue().length<3){
			    iRet=8;
			    this._setErrorStatus("ipTestCase","Missing Test Case(min 3 char)");
			}
			if(this.getView().byId("ipNote").getValue().length<3){
			    iRet=8;
			    this._setErrorStatus("ipNote","Missing Note(min 3 char)");
			}
			if (oSQL.length != 0) {
				oBody.SQL = oSQL;
				jQuery.ajax({
					url: sURL,
					method: "POST",
					dataType: "json",
					contentType: "application/json",
					data: oSQL,
					context: this,
					async:false,
					success: jQuery.proxy(function(output) {
						var oModel = new sap.ui.model.json.JSONModel(output);
						var objOutput = oModel.getData();
						if((objOutput.RET_CODE==="0" || objOutput.RET_CODE===0)){
						    if(iRet===0){
						        this._updateDB();
						    }
						}else{
						    this._setErrorStatus("ipSQL",objOutput.MESSAGE);
						}
					},this),
					error: jQuery.proxy(function(err) {
					    iRet=8;
					    this._setErrorStatus("ipSQL",err.responseText);
						window.console.error(err.responseText);
					},this)

				});
			} 
			
		},
		// ============================================================
		// Helper function to update the table
		// ============================================================
		_updateDB:function(){
		    var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("xsjs.sessionInfo");
		    var sContext = this._getCurrentContext();
		    var mUserModel = new sap.ui.model.json.JSONModel();
		    mUserModel.loadData(sURL,"",false,"GET");
		    var sUser = mUserModel.getData().USER_NAME;
		    var oTestCase = {};
		    var sCreatedOn = new Date();
		    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
		    var sBus = sBus=this.getView().byId("ipBusinessArea").getValue();
		    if(sContext!==""){
		        sCreatedOn = this.getView().byId("ipCreatedOn").getValue();
		        if(this.getView().byId("selectBusinessArea").getSelectedKey()==="--NEW--"){
		            sBus=this.getView().byId("ipBusinessArea").getValue();
		        }else{
		            sBus = this.getView().byId("selectBusinessArea").getSelectedKey();
		        }
		    }
		    oTestCase.TEST_CASE = this.getView().byId("ipTestCase").getValue();
            oTestCase.TEST_CASE_DESCRIPTION = this.getView().byId("ipNote").getValue();
            oTestCase.TEST_CASE = this.getView().byId("ipTestCase").getValue();
            oTestCase.SQL_CODE = this.getView().byId("ipSQL").getValue();
            oTestCase.EXEC_TYPE= "EXECUTE";
            oTestCase.BUSINESS_AREA = sBus;
            oTestCase.CREATED_ON = sCreatedOn;
            oTestCase.UPDATED_ON = new Date();
            oTestCase.IS_VALID = 1;
            oTestCase.IS_ACTIVE = 0;
            oTestCase.AUTHOR = sUser;
            var sTestCaseURL = sOrigin + this._getResData("odata.testcase");
            var mTestCaseModel = new ODataModel(sTestCaseURL);
            if(sContext===""){
                mTestCaseModel.create("/TestCase",oTestCase,{
                    success: function() {
						MessageToast.show("Test Entry created successfully");
					},
					error: function(err) {
					    var oError = JSON.parse(err.responseText);
						MessageBox.show(oError.error.message.value, {
							title: "Error",
							onClose: null,
							icon: sap.m.MessageBox.Icon.ERROR,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit // default
						});
					}
                });
            }else{
                var oUpdateCase = {};
                oUpdateCase.TEST_CASE_DESCRIPTION = oTestCase.TEST_CASE_DESCRIPTION;
                oUpdateCase.SQL_CODE = oTestCase.SQL_CODE;
                oUpdateCase.UPDATED_ON = new Date();
                oUpdateCase.IS_VALID = 1;
                oUpdateCase.IS_ACTIVE = 0;
                oUpdateCase.AUTHOR = oTestCase.AUTHOR; 
                
                mTestCaseModel.update(sContext, oUpdateCase, {
						success: function() {
							MessageToast.show("Test Case updated successfully");
						},
						error: function(err) {
							MessageBox.show("Error while updating Test Case Entry", {
								title: "Error",
								onClose: null,
								icon: sap.m.MessageBox.Icon.ERROR,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit // default
							});
						}
					});
            }
		}

	});
});