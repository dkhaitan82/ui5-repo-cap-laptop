sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, JSONModel, ODataModel,Filter,FilterOperator) {
    "use strict";
    return Controller.extend("dk.sample.controller.Home", {
        // ============================================================
        // Initialize
        // ============================================================
        onInit: function () {
            this.busyDialog = this.getView().byId("BusyDialog");
            var oThis = this;
            this.busyDialog.open();
            var oModel = this.getOwnerComponent().getModel("northwind");
            this.getView().setModel(new JSONModel(),"field");

            oModel.attachMetadataLoaded(function (oEvent) {
                this._processMetaData(oModel.getServiceMetadata());
                //window.console.log(oModel.getServiceMetadata());
                this.busyDialog.close();
            }, this)
            // handle metadata error
            oModel.attachMetadataFailed(function (oEvent) {
                this.busyDialog.close();
                MessageBox.error("Error while loading metadata", {
                    title: "Error"
                });

            }, this);

        },
        _processMetaData: function (oMetaData) {
            var aData = [];
            var sNameSpace = oMetaData.dataServices.schema[0].namespace + ".";
            var aEntitySets = oMetaData.dataServices.schema[1].entityContainer[0].entitySet;
            $.each(aEntitySets, function (indx, elem) {
                var sEntityType = elem.entityType.substring(sNameSpace.length);
                var oData = {};
                oData.Entity = elem.name;
                var aRawFields = [];
                aRawFields = oMetaData.dataServices.schema[0].entityType.filter(function (entity) {
                    return entity.name === sEntityType;
                });
                var aFields = [];
                if (aRawFields.length > 0) {
                    $.each(aRawFields[0].property, function (indx, prop) {
                        var oProp = {};
                        oProp.Name = prop.name;
                        oProp.Type = prop.type;
                        if (prop.type === "Edm.DateTime") {
                            oProp.Length = "";
                        } else if (prop.type === "Edm.Int32") {
                            oProp.Length = "";
                        } else if (prop.type === "Edm.String") {
                            oProp.Length = prop.maxLength;
                        } else if (prop.type === "Edm.Decimal") {
                            oProp.Length = prop.precision;
                        } else {
                            oProp.Length = "";
                        }
                        oProp.Key="";
                        $.each(aRawFields[0].key.propertyRef, function (indx, sKey) {
                            if(oProp.Name===sKey.name){
                                oProp.Key="Yes";
                            }
                        });
                        aFields.push(oProp);
                    });
                    oData.Fields = aFields;
                }
                aData.push(oData);
            });
            var oModel=new JSONModel(aData);
            this.getView().setModel(oModel,"ent");
        },
        // ============================================================
        // Open Jobs Email alert view
        // ============================================================
        onPage1: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("page_1");
        },
        onSelectEntity:function(oEvent){
            this.getView().byId("mainContainer").to(this.createId("entityDetail"));
            var sPath = oEvent.getParameter("listItem").getBindingContext("ent").getPath();
            var aFields=this.getView().getModel("ent").getProperty(sPath+"/Fields");
            this.getView().getModel("field").setData(aFields);
            var aColumns=[];
            var aData=[];
            var oThis=this;
            $.each(aFields, function (index, field) { 
                 aColumns.push(field.Name)
            });
            var sEntity="/"+this.getView().getModel("ent").getProperty(sPath).Entity;
            var oModel=this.getOwnerComponent().getModel("northwind");
            //window.console.log(sEntity);
            oModel.read(sEntity,{
            success:function(oData,oRes){
                //window.console.log(oData);
                var dataModel=new JSONModel({COLUMNS:aColumns,DATA:oData.results})
                oThis.getView().setModel(dataModel,"data");
                oThis._paintDataTable(oThis._selectInitialData());
            },
            error:function(e){
                window.console.log(e);
            }});
        },
        // ============================================================
		// Paint the table again                                     
		// ============================================================
		_paintDataTable:function(oData){
            //var oFieldModel=this.getView().getMod
		    var oModel = new JSONModel();
            oModel.setData(oData);
            var oTable = this.getView().byId("tableData");
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
                        //window.console.log(obj);
                        //window.console.log(k);
                        if(k==="Picture"){
                            row.addCell(new sap.m.Image({src : "data:image/png,"+obj[k]}));
                        }else{
                            row.addCell(new sap.m.Text({text : obj[k]}));
                        }
                        
                }
                return row;
            });
        },
        // ============================================================
		// Get test Data from test results                                     
		// ============================================================
		_selectInitialData:function(){
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
		// Event function to search columns in dialog                               
		// ============================================================
		onColumnSearch:function(oEvent){
		    var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
        },
        onShowDataTable:function(oEvent){
            this.getView().byId("mainContainer").to(this.createId("dataDetail"));
        },
        onPressDataDetailBack:function(oEvent){
            this.getView().byId("mainContainer").to(this.createId("entityDetail"));
        },
        onChooseColumnsData:function(oEvent){
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
		        this._paintDataTable({COLUMNS:aSelectedColumns, DATA:aData});
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
		}

    });
});

