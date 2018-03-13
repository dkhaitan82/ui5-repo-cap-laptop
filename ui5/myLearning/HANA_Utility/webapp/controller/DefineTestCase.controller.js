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
	return Controller.extend("burberry.hana.util.controller.DefineTestCase", {
	    // ============================================================
		// Initialize                               
		// ============================================================
		onInit: function() {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var tcModel = new ODataModel(sURL);
			this.getView().setModel(tcModel, "tcd");
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function() {
					this.getView().getModel("tcd").refresh();
					this._sortOnStart();
				}, this),
				onAfterHide: function(evt) {}
			});

			this.mGroupFunctions = {
				BUSINESS_AREA: function(oContext) {
					var name = oContext.getProperty("BUSINESS_AREA");
					return {
						key: name,
						text: name
					};
				},
				AUTHOR: function(oContext) {
					var name = oContext.getProperty("AUTHOR");
					return {
						key: name,
						text: name
					};
				},
				IS_ACTIVE: function(oContext) {
					var name = oContext.getProperty("IS_ACTIVE");
					return {
						key: name,
						text: name
					};
				}
			};
			this._sortOnStart();
		},
		// ============================================================
		// Helper function to get Service URLs                               
		// ============================================================
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		// ============================================================
		// Icon to format whether Test Cases are active or not                               
		// ============================================================
		formatActiveIcon: function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},
		// ============================================================
		// Open selection dialog                               
		// ============================================================
		onSortFilterOpen: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("burberry.hana.util.view.TestCaseSortFilter", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		// ============================================================
		// Go to New Test Case create view                               
		// ============================================================
		onCreateTestCase: function(oEvent) {
			this.getOwnerComponent().getModel("app").setProperty("/data/test/item_path", "");
			this.getOwnerComponent().getRouter().navTo("testCaseDefineItem", null, true);
		},
		// ============================================================
		// Not used now                               
		// ============================================================
		onTestCaseSelect: function(oEvent) {

		},
		// ============================================================
		// Helper function to sort test case data                             
		// ============================================================
		_sortOnStart: function() {
			var oTable = this.getView().byId("tableTestCase");
			var oBinding = oTable.getBinding("items");
			var aSorters = [];
			aSorters.push(new Sorter("UPDATED_ON", true, undefined));
			oBinding.sort(aSorters);
		},
		// ============================================================
		// Event while confirming tescase sort filter dialog                               
		// ============================================================
		onSortFilterConfirm: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tableTestCase");
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			var valBusinessArea = this._oDialog.getFilterItems()[0].getCustomControl().getValue();
			var valTestCase = this._oDialog.getFilterItems()[1].getCustomControl().getValue();
			var valNote = this._oDialog.getFilterItems()[2].getCustomControl().getValue();
			var valType = this._oDialog.getFilterItems()[3].getCustomControl().getValue();
			var valAuthor = this._oDialog.getFilterItems()[4].getCustomControl().getValue();
			var valUpdatedFrom = this._oDialog.getFilterItems()[5].getCustomControl().getValue();
			var valUpdatedTo = this._oDialog.getFilterItems()[6].getCustomControl().getValue();
			var valExecFrom = this._oDialog.getFilterItems()[7].getCustomControl().getValue();
			var valExecTo = this._oDialog.getFilterItems()[8].getCustomControl().getValue();
			var valValid = this._oDialog.getFilterItems()[9].getCustomControl().getSelectedKey();
			var valActive = this._oDialog.getFilterItems()[10].getCustomControl().getSelectedKey();
			//window.console.log(valBusinessArea+"/"+valTestCase+"/"+valNote+"/"+valType+"/"+valAuthor+"/"+valUpdatedFrom+"/"+valUpdatedTo+"/"+valValid+valActive);
			var aFilters = [];
			var filterString = "";
			if (valBusinessArea != "") {
				aFilters.push(new Filter("BUSINESS_AREA", FilterOperator.Contains, valBusinessArea));
				filterString += "Business Area[" + valBusinessArea + "]";
			}
			if (valTestCase != "") {
				aFilters.push(new Filter("TEST_CASE", FilterOperator.Contains, valTestCase));
				filterString += "Test Case[" + valTestCase + "]";
			}
			if (valNote != "") {
				aFilters.push(new Filter("TEST_CASE_DESCRIPTION", FilterOperator.Contains, valNote));
				filterString += "Note[" + valNote + "]";
			}
			if (valType != "") {
				aFilters.push(new Filter("EXEC_TYPE", FilterOperator.Contains, valType));
				filterString += "Type[" + valType + "]";
			}
			if (valAuthor != "") {
				aFilters.push(new Filter("AUTHOR", FilterOperator.Contains, valAuthor));
				filterString += "Author[" + valAuthor + "]";
			}
			if (valUpdatedFrom != "") {
				if (valUpdatedTo != "") {
					aFilters.push(new Filter("UPDATED_ON", FilterOperator.BT, valUpdatedFrom, valUpdatedTo));
					filterString += "Updated[" + valUpdatedFrom + "-" + valUpdatedTo + "]";
				} else {
					aFilters.push(new Filter("UPDATED_ON", FilterOperator.EQ, valUpdatedFrom));
					filterString += "Updated[" + valUpdatedFrom + "]";
				}
			}
			if (valExecFrom != "") {
				if (valExecTo != "") {
					aFilters.push(new Filter("EXEC_DATE", FilterOperator.BT, valExecFrom, valExecTo));
					filterString += "Execution On[" + valExecFrom + "-" + valExecTo + "]";
				} else {
					aFilters.push(new Filter("EXEC_DATE", FilterOperator.EQ, valExecFrom));
					filterString += "Execution On[" + valExecFrom + "]";
				}
			}
			if (valValid != "") {
				aFilters.push(new Filter("IS_VALID", FilterOperator.EQ, valValid));
				filterString += "Valid[" + valValid + "]";
			}
			if (valActive != "") {
				aFilters.push(new Filter("IS_ACTIVE", FilterOperator.EQ, valActive));
				filterString += "Active[" + valActive + "]";
			}
			oBinding.filter(aFilters);
			oView.byId("filterBar").setVisible(aFilters.length > 0);
			oView.byId("filterBarLabel").setText(filterString);
		},
		// ============================================================
		// Reset sort and filter                              
		// ============================================================
		onSortFilterReset: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("tableTestCase");
			var oBinding = oTable.getBinding("items");
			this._oDialog.getFilterItems()[0].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[1].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[2].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[3].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[4].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[5].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[6].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[7].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[8].getCustomControl().setValue("");
			this._oDialog.getFilterItems()[9].getCustomControl().setSelectedKey("");
			this._oDialog.getFilterItems()[10].getCustomControl().setSelectedKey("");
			var aFilters = [];
			//oBinding.filter(aFilters);
			//oView.byId("filterBar").setVisible(aFilters.length > 0);
			//oView.byId("filterBarLabel").setText("");
		},
		// ============================================================
		// Enable multiple selection of Test Case table                               
		// ============================================================
		onMultiSelectEnable: function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.getOwnerComponent().getModel("app").setProperty("/data/test/test_case_table_select_mode", "MultiSelect");
			} else {
				this.getOwnerComponent().getModel("app").setProperty("/data/test/test_case_table_select_mode", "SingleSelectLeft");
			}

		},
		// ============================================================
		// Not Used- Test function                              
		// ============================================================
		_displayJSON: function(sPath) {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var oModel = new ODataModel(sURL);
			oModel.read(sPath, {
				success: function(oData, response) {
					window.console.log(JSON.stringify(oData));
				},
				error: function(msg) {
					window.console.log(JSON.stringify(msg));
				}
			});
		},
		// ============================================================
		// Event function to go to edit view of Test Cases                               
		// ============================================================
		onEditTestCase: function(oEvent) {
			var oSelectedItems = this.getView().byId("tableTestCase").getSelectedItems();
			if (oSelectedItems.length > 1) {
				MessageToast.show("Please select only one item");
			} else if (oSelectedItems.length == 0) {
				MessageToast.show("Please select only one item");
			} else if (oSelectedItems.length == 1) {
				var oPath = oSelectedItems[0].oBindingContexts.tcd.sPath;
				//this._displayJSON(oPath);
				this.getOwnerComponent().getModel("app").setProperty("/data/test/item_path", oPath);
				this.getOwnerComponent().getRouter().navTo("testCaseDefineItem", null, true);
			}

		},
		// ============================================================
		// Not used                               
		// ============================================================
		_updateSuccess: function(oSuccess) {

		},
		// ============================================================
		// Activate test case to execute                              
		// ============================================================
		onActivateTestCase: function(oEvent) {
			var oIsActive = 0;
			if (oEvent.getSource().getIcon() == "sap-icon://connected") {
				oIsActive = 1;
			}
			var oSelectedItems = this.getView().byId("tableTestCase").getSelectedItems();
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.testcase");
			var oModelUpdate = this.getView().getModel("tcd");
			var oParam = {
				groupId: "UPDATE_ACTIVATE",
				success: jQuery.proxy(this._updateSuccess, this),
				error: function(err) {
					window.console.error(JSON.stringify(err));
				}
			};
			oModelUpdate.setUseBatch(true);
			if (oSelectedItems.length) {
				for (var i = 0; i < oSelectedItems.length; i++) {
					var oPath = oSelectedItems[i].oBindingContexts.tcd.sPath;
					var testCaseJSON = {};
					testCaseJSON.IS_ACTIVE = oIsActive;
					oModelUpdate.update(oPath, testCaseJSON, oParam);
				}
				oModelUpdate.submitChanges(oParam);
				oModelUpdate.refresh(true, true);
			} else {
				MessageToast.show("Please select item first");
			}

		},
		// ============================================================
		// Event function to delete test case                             
		// ============================================================
		onDeleteTestCase: function() {
			var oSelectedItems = this.getView().byId("tableTestCase").getSelectedItems();
			var oModel = this.getView().getModel("tcd");
			if (oSelectedItems.length > 0) {
				MessageBox.show(
					"Are you sure to delete?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction == "YES") {
								for (var i = 0; i < oSelectedItems.length; i++) {
									var oPath = oSelectedItems[i].oBindingContexts.tcd.sPath;
									oModel.remove(oPath, {
										success: function(p) {
											MessageToast.show("Deleted Successfully");
										},
										error: function(p) {
											window.console.error(p);
											MessageToast.show("Cannot Delete check console");
										}
									});

								}
								oModel.refresh(true);
							}
						}
					}
				);
			} else {
				MessageToast.show("Please select row");
			}
		},
		// ============================================================
		// Test function - not used                               
		// ============================================================
		_testArray:function(){
	        			var data1 = {
				data: [
					{
						c2: "d2",
						c3: "d3",
						c1: "d1"
					},
					{
						f3: "v3",
						f1: "v1",
						f2: "v2"
					},
					{
						a1: "b1",
						a3: "b3",
						a2: "b2"
					}
		        ]
			};
			var data2 = {
				data: [
					{
						a1: "b1",
						a3: "b3",
						a2: "b2"
					},
					{
						f2: "v2",
						f3: "v3",
						f1: "v1"
					},
					{
						c2: "d2",
						c3: "d3",
						c1: "d1"
					}
		        ]
			};
			var match = true;
			var found1 = false;
			jQuery.each(data1.data, function(index1, obj1) {
				found1 = false;
				jQuery.each(data2.data, function(index2, obj2) {
					if (jQuery.sap.equal(obj1, obj2)) {
						found1 = true;
					}
				});
				if (found1 === false) {
					match = false;
				}
			});
			jQuery.each(data2.data, function(index1, obj1) {
				found1 = false;
				jQuery.each(data1.data, function(index2, obj2) {
					if (jQuery.sap.equal(obj1, obj2)) {
						found1 = true;
					}
				});
				if (found1 === false) {
					match = false;
				}
			});
			if (match) {
				MessageToast.show("They are equal");
			} else {
				MessageToast.show("They are not equal");
			}
			/* Download code
		    var a = window.document.createElement('a');
		    a.href = window.URL.createObjectURL(new Blob([JSON.stringify(data2)], {type: 'text/json'}));
		    a.download = 'test.json';
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
		    */
			//Upload Code
			var element = document.createElement('div');
			element.innerHTML = '<input type="file">';
			var fileInput = element.firstChild;

			fileInput.addEventListener('change', function() {
				var file = fileInput.files[0];

				if (file.name.match(/\.(txt|json)$/)) {
					var reader = new FileReader();

					reader.onload = function() {
						window.console.log(reader.result);
					};

					reader.readAsText(file);
				} else {
					alert("File not supported, .txt or .json files only");
				}
			});

			fileInput.click();    
		},
		// ============================================================
		// TO BE Implemented @TODO                            
		// ============================================================
		onSearchTestCase: function() {
      
		},
		formatNote:function(sValue){
		    if(sValue===undefined){
		        return "";
		    }else{
		        return sValue.substring(0,30);
		    }
		}
	});
});