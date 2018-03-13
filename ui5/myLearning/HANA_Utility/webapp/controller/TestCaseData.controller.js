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
	return Controller.extend("burberry.hana.util.controller.TestCaseData", {
	    // ============================================================
		// Initialize                                     
		// ============================================================
		onInit: function() {
            this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function() {
					this._startView();
				}, this),
				onAfterHide: function(evt) {}
			});
		},
		_startView:function(){
		    var oAppModel=this.getOwnerComponent().getModel("app");
		    var oData = oAppModel.getProperty("/data/test/tc_data");
		    var oDataModel = new JSONModel();
		    oDataModel.setData(oData);
		    this.getView().setModel(oDataModel,"data");
		    this._paintAfterImageTable(this._selectInitialAfterImage());
		    
		},
		// ============================================================
		// Get test Data from test results                                     
		// ============================================================
		_selectInitialAfterImage:function(){
		    var biData= this.getView().getModel("data").getData();
		    var oRow ={};
		    var oOutput = {};
		    var aData=[];
		    var aCol = [];
		    if(biData.COLUMNS.length>=8){
		        for(var i=0;i<8;i++){
		            aCol.push(biData.COLUMNS[i]);
		        }
		        for(var j=0;j<biData.DATA.length;j++){
		            oRow={};
		            for(var k=0;k<aCol.length;k++){
		               oRow[aCol[k]]= biData.DATA[j][aCol[k]];
		            }
		            aData.push(oRow);
		        }
		    }else{
		        aData=biData.DATA;
		        aCol=biData.COLUMNS;
		    }
		    oOutput.DATA = aData;
		    oOutput.COLUMNS = aCol;
		    return oOutput;
		},
		// ============================================================
		// Paint the table again                                     
		// ============================================================
		_paintAfterImageTable:function(oData){
		    var oModel = new JSONModel();
            oModel.setData(oData);
            var oTable = this.getView().byId("tableTestCaseData");
            oTable.setModel(oModel);
            oTable.bindAggregation("columns", "/COLUMNS", function(index, context) {
                    return new sap.m.Column({
                        header: new sap.m.Label({text: context.getObject()})
                    });
            }); 
            
            oTable.bindItems("/DATA", function(index, context) {
                var obj = context.getObject();
                var row = new sap.m.ColumnListItem();
                for(var k in obj) {
                        row.addCell(new sap.m.Text({text : obj[k]}));
                }
                return row;
            });
            oTable.setVisible(true);
		},
		// ============================================================
		// Event function to choose columns in dialog                                     
		// ============================================================
		onChooseColumnsAfterImage:function(oEvent){
		    var biData = this.getView().getModel("data").getData();
		    var oModel = new sap.ui.model.json.JSONModel();
		    oModel.setData(biData);
		    var oColumnTable = this.getView().byId("ColumnsDialog");
		    oColumnTable.setModel(oModel);
		    oColumnTable.bindItems("/COLUMNS",function(index,context){
                var obj = context.getObject();
                var row = new sap.m.ColumnListItem();
                row.addCell(new sap.m.Text({text : obj}));
                return row;
            });
		    oColumnTable.open();
		},
		// ============================================================
		// After selecting columns in choose dialog                                     
		// ============================================================
		onChooseColumns:function(oEvent){
		    var aContexts=oEvent.getParameter("selectedContexts");
		    var aSelectedColumns = [];
		    var aData = [];
		    var iCount = 0;
		    if(aContexts.length>8){
		        iCount = 8;
		    }else{
		        iCount=aContexts.length;
		    }
		    
		    for(var i=0;i<iCount;i++){
		        aSelectedColumns.push(aContexts[i].getObject());
		    }
		    //var oSelectedItems = this.getView().byId("tableAfterImage").getSelectedItems();
		    var oAllData = this.getView().getModel("data").getData();
		    for(var j=0;j<oAllData.DATA.length;j++){
		        var oRow={};
		        for(var k=0;k<aSelectedColumns.length;k++){
		            oRow[aSelectedColumns[k]]=oAllData.DATA[j][aSelectedColumns[k]];
		        }
		        aData.push(oRow);
		    }
		    if(aSelectedColumns.length>0){
		        this._paintAfterImageTable({COLUMNS:aSelectedColumns, DATA:aData});
		    }
		    if(aContexts.length > 8){
		        MessageToast.show("Only 8 columns can be shown");
		    }
		},
		// ============================================================
		// Event function to search columns in dialog                               
		// ============================================================
		onColumnSearch:function(oEvent){
		    var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		// ============================================================
		// Download data in excel                               
		// ============================================================
		onDownloadExcel:function(oEvent){
		    var oData = this.getView().getModel("data").getData();
		    ExcelDownloader.downloadExcel([{
		        sheetName:"AfterImage",
		        columns:oData.COLUMNS,
		        data:oData.DATA
		    }]);
		    
		},
		// ============================================================
		// Back                               
		// ============================================================
		onNavBack:function(){
		    var sParentType=this.getOwnerComponent().getModel("app").getProperty("/data/test/tc_data_type");
		    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		    if(sParentType==="AFTER"){
		        oRouter.navTo("afterImageView");
		    }else if(sParentType==="BEFORE"){
		        oRouter.navTo("beforeImageView");
		    }
		}
	});
});