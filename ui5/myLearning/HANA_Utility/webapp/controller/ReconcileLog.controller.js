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
	return Controller.extend("burberry.hana.util.controller.ReconcileLog", {
	    // ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
		    var oUIData={
		        match_filter:"ALL",
		        performance_filter:"ALL"
		    };
		    var oUIModel=new JSONModel();
		    oUIModel.setData(oUIData);
		    this.getView().setModel(oUIModel,"ui");
		},
		// ============================================================
		// Helper function to reconcile test log
		// ============================================================
		_reconcileData:function(data1,data2){
		    var match = "YES";
			var found1 = false;
			jQuery.each(data1, function(index1, obj1) {
				found1 = false;
				jQuery.each(data2, function(index2, obj2) {
					if (jQuery.sap.equal(obj1, obj2)) {
						found1 = true;
					}
				});
				if (found1 === false) {
					match = "NO";
					window.console.log(obj1);
				}
			});
			jQuery.each(data2, function(index1, obj1) {
				found1 = false;
				jQuery.each(data1, function(index2, obj2) {
					if (jQuery.sap.equal(obj1, obj2)) {
						found1 = true;
					}
				});
				if (found1 === false) {
					match = "NO";
					window.console.log(obj1);
				}
			});
			return match;
		},
		// ============================================================
		// Refresh reconcile log table
		// ============================================================
		onLoadPage:function(oEvent){
		    var oBIModel = this.getOwnerComponent().getModel("cbi");
		    var oAIModel = this.getOwnerComponent().getModel("cai");
		    var oThis = this;
		    var oReconData = {results:[]};
		    if(oBIModel !== undefined && oAIModel !== undefined){
		        var oBIData = oBIModel.getData().results;
		        var oAIData = oAIModel.getData().results;
		        jQuery.each(oBIData,function(index,oBIObj){
		            var aAIObj = jQuery.grep(oAIData,function(obj){
		                return oBIObj.BUSINESS_AREA === obj.BUSINESS_AREA && oBIObj.TEST_CASE === obj.TEST_CASE;
		            });
		            if(aAIObj.length > 0){
		                var oAIObj = aAIObj[0];
		                var oReconObj = {};
		               oReconObj.BUSINESS_AREA = oAIObj.BUSINESS_AREA;
		               oReconObj.TEST_CASE = oAIObj.TEST_CASE;
		               oReconObj.BEFORE_RUN_TIME = oBIObj.RUN_TIME;
		               oReconObj.AFTER_RUN_TIME = oAIObj.RUN_TIME;
		               oReconObj.RUN_TIME_DIFFERENCE = oBIObj.RUN_TIME-oAIObj.RUN_TIME;
		               oReconObj.DATA_RECONCILE = oThis._reconcileData(oBIObj.DATA,oAIObj.DATA);
		               oReconObj.BEFORE_SQL_CODE = oBIObj.SQL_CODE;
		               oReconObj.AFTER_SQL_CODE = oAIObj.SQL_CODE;
		               oReconObj.BEFORE_DATA = oBIObj.DATA;
		               oReconObj.AFTER_DATA = oAIObj.DATA;
		               oReconObj.BEFORE_COLUMNS = oBIObj.COLUMNS;
		               oReconObj.AFTER_COLUMNS = oAIObj.COLUMNS;
		               oReconObj.TEST_CASE_DESCRIPTION = oBIObj.TEST_CASE_DESCRIPTION;
		               oReconData.results.push(oReconObj);
		            }
		        });
		        var oReconModel = new JSONModel();
		        oReconModel.setData(oReconData);
		        this.getView().setModel(oReconModel,"rec");
		    }else{
		        MessageToast.show("Please upload before/after image test results");
		    }
		    
		},
		// ============================================================
		// Format icon for return code
		// ============================================================
		formatReturnCodeIconColor: function(code) {
            return code==="YES"?"#00ff00":"#ff3300";
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
		formatNote:function(sValue){
		    if(sValue===undefined){
		        return "";
		    }else{
		        return sValue.substring(0,30);
		    }
		},
		// ============================================================
		// Format performance icon
		// ============================================================
		formatPerformanceIcon:function(oValue){
		    if(oValue > 0){
		        return "sap-icon://arrow-top";
		    }else if(oValue===0){
		        return "sap-icon://minimize";
		    }else if(oValue < 0){
		        return "sap-icon://arrow-bottom";
		    }
		},
		// ============================================================
		// Format performace icon color
		// ============================================================
		formatPerformanceColor:function(oValue){
		    if(oValue > 0){
		        return "#00FF00"; //Green
		    }else if(oValue===0){
		        return "#808080"; //Grey
		    }else if(oValue < 0){
		        return "#FF0000"; //Red;
		    }
		},
		// ============================================================
		// Search Table
		// ============================================================
		onSearchData:function(oEvent){
			var sQuery = this.getView().byId("inputSearch").getValue();
			var sPerf=this.getView().byId("selectStatusPerformance").getSelectedKey();
			var sRecon = this.getView().byId("selectStatusRecon").getSelectedKey();
     		var aFilter = [];
			if (sQuery) {
				aFilter.push(new Filter({
                        filters: [
                          new Filter({
                            path: 'BUSINESS_AREA',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          }),
                          new Filter({
                            path: 'TEST_CASE',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          }),
                          new Filter({
                            path: 'TEST_CASE_DESCRIPTION',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          })
                        ],
                        and: false
                      }));
			}
			if(sRecon==="YES"){
			    aFilter.push(new Filter("DATA_RECONCILE", FilterOperator.EQ, "YES"));
			}else if(sRecon==="NO"){
		        aFilter.push(new Filter("DATA_RECONCILE", FilterOperator.EQ, "NO"));
			} 
			if(sPerf==="YES"){
		        aFilter.push(new Filter("RUN_TIME_DIFFERENCE", FilterOperator.GE, 0));
			}else if(sPerf==="NO"){
			    aFilter.push(new Filter("RUN_TIME_DIFFERENCE", FilterOperator.LT, 0));
			}
			var oFilter=null;
			if(aFilter.length!==0){
			    oFilter=new Filter({
                        filters: aFilter,
                        and: true
                      });
			}
		    this.getView().byId("tableReconcile").getBinding("items").filter(oFilter, "Application");
		},
		// ============================================================
		// Download Data
		// ============================================================
		onDownload:function(oEvent){
		    var item = oEvent.getSource().getParent();
		    var oData = item.getBindingContext("rec").getObject();
		    ExcelDownloader.downloadExcel([{
		        sheetName:"BeforeImage",
		        columns:oData.BEFORE_COLUMNS,
		        data:oData.BEFORE_DATA
		    },
		    {
		        sheetName:"AfterImage",
		        columns:oData.AFTER_COLUMNS,
		        data:oData.AFTER_DATA
		    }
		    
		    ]);
		}
	});
});