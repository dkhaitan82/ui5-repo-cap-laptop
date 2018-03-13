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
	return Controller.extend("burberry.hana.util.controller.CheckVirtualColumn", {
	    // ============================================================
		// Initialize                               
		// ============================================================
		onInit: function() {
		},
		// ============================================================
		// Get services urls
		// ============================================================
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		// ============================================================
		// Take backup of VCs in JSON
		// ============================================================
		onDownloadVC:function(oEvent){
		    var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.vc");
			var vcModel = new ODataModel(sURL);
			vcModel.read("/VirtualColumns",{
			    success:function(oData){
			        var a = window.document.createElement('a');
    				a.href = window.URL.createObjectURL(new Blob([JSON.stringify(oData.results)], {
    					type: 'text/json'
    				}));
    				a.download = 'VC_Backup.json';
    				document.body.appendChild(a);
    				a.click();
    				document.body.removeChild(a);
			    },
			    error:function(oError){
			       window.console.error(oError);
			       sap.m.MessageToast.show("Error while reading data. Check console for details");
			    }
			});
		},
		// ============================================================
		// Helper function to upload the VC from backup
		// ============================================================
		_uploadJSON:function(){
		    var oThis = this;
			var element = document.createElement('div');
			element.innerHTML = '<input type="file">';
			var fileInput = element.firstChild;

			fileInput.addEventListener('change', function() {
				var file = fileInput.files[0];

				if (file.name.match(/\.(txt|json)$/)) {
					var reader = new FileReader();
					reader.onload = function() {
						var oModel = new JSONModel();
						oModel.setJSON(reader.result);
						oThis._readSystemVC(oModel.getData());
					};
					reader.onloadstart=function(){
					  oThis.getView().byId("statusTitle").setText("Load Started..");
					};
					reader.onloadend=function(){
					  oThis.getView().byId("statusTitle").setText(""); 
					};
					reader.onprogress = function(){
					    oThis.getView().byId("statusTitle").setText("Load In Progress..");
					};
                    reader.onerror=function(){
                        oThis.getView().byId("statusTitle").setText("Load Error try again....");
                    };
                    
					reader.readAsText(file);
				} else {
					alert("File not supported, .txt or .json files only");
				}
			});

			fileInput.click();
		},
		// ============================================================
		// Helper function to upload the VC from backup
		// ============================================================
		_readSystemVC:function(aBackup){
		   var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.vc");
			var vcModel = new ODataModel(sURL);
			var oThis = this;
		    vcModel.read("/VirtualColumns",{
			    success:function(oData){
			       var aVC=[];
			       jQuery.each(aBackup,function(idx,obj){
			           var oRec={};
			           var index=oData.results.findIndex(function(obj1){
			               return obj.SCHEMA_NAME === obj1.SCHEMA_NAME &&
			                      obj.TABLE_NAME === obj1.TABLE_NAME &&
			                      obj.COLUMN_NAME === obj1.COLUMN_NAME;
			           });
			           if(index===-1){
			                oRec.SCHEMA_NAME_BACKUP = obj.SCHEMA_NAME;
                            oRec.TABLE_NAME_BACKUP=obj.TABLE_NAME;
                            oRec.COLUMN_NAME_BACKUP=obj.COLUMN_NAME;
                            oRec.DATA_TYPE_NAME_BACKUP=obj.DATA_TYPE_NAME;
                            oRec.LENGTH_BACKUP=String(obj.LENGTH);
                            oRec.SCALE_BACKUP=String(obj.SCALE);
                            oRec.GENERATED_ALWAYS_AS_BACKUP=obj.GENERATED_ALWAYS_AS;
                            oRec.SCHEMA_NAME_SYSTEM = "";
                            oRec.TABLE_NAME_SYSTEM = "";
                            oRec.COLUMN_NAME_SYSTEM = "";
                            oRec.DATA_TYPE_NAME_SYSTEM = "";
                            oRec.LENGTH_SYSTEM="";
                            oRec.SCALE_SYSTEM="";
                            oRec.GENERATED_ALWAYS_AS_SYSTEM="";
                            oRec.STATUS=false;
                            oRec.MESSAGE="VC Not Available";
                            aVC.push(oRec);
			           }else{
			              var obj1=oData.results[index];
			                oRec.SCHEMA_NAME_BACKUP = obj.SCHEMA_NAME;
                            oRec.TABLE_NAME_BACKUP=obj.TABLE_NAME;
                            oRec.COLUMN_NAME_BACKUP=obj.COLUMN_NAME;
                            oRec.DATA_TYPE_NAME_BACKUP=obj.DATA_TYPE_NAME;
                            oRec.LENGTH_BACKUP=String(obj.LENGTH);
                            oRec.SCALE_BACKUP=String(obj.SCALE);
                            oRec.GENERATED_ALWAYS_AS_BACKUP=obj.GENERATED_ALWAYS_AS;
                            oRec.SCHEMA_NAME_SYSTEM = obj1.SCHEMA_NAME;
                            oRec.TABLE_NAME_SYSTEM = obj1.TABLE_NAME;
                            oRec.COLUMN_NAME_SYSTEM = obj1.COLUMN_NAME;
                            oRec.DATA_TYPE_NAME_SYSTEM = obj1.DATA_TYPE_NAME;
                            oRec.LENGTH_SYSTEM=String(obj1.LENGTH);
                            oRec.SCALE_SYSTEM=String(obj1.SCALE);
                            oRec.GENERATED_ALWAYS_AS_SYSTEM=obj1.GENERATED_ALWAYS_AS;
                            oThis._reconVC(oRec);
                            aVC.push(oRec);
			           }
			       }); 
			       var aUniqueSchema=oThis._getUniqueSchema(aVC);
			       oThis.getView().setModel(new JSONModel(aVC),"vc");
			       oThis.getView().setModel(new JSONModel(aUniqueSchema),"sc");
			    },
			    error:function(oError){
			       window.console.error(oError);
			       sap.m.MessageToast.show("Error while reading data. Check console for details");
			    }
			});
		},
		// ============================================================
		// Build unique schema list for Select
		// ============================================================
		_getUniqueSchema:function(aVC){
		    var aU=[];
		    aU.push({SCHEMA:"ALL_SCHEMA"});
		    $.each(aVC, function(index, line) {
                var aTemp = $.grep(aU, function (obj) {
                    return line.SCHEMA_NAME_BACKUP === obj.SCHEMA;
                });
                if (aTemp .length === 0) {
                  var oSC={};
                  oSC.SCHEMA=line.SCHEMA_NAME_BACKUP;
                  aU.push(oSC);
                }
            });
            return aU;
		    
		},
		
		// ============================================================
		// Event to upload VC
		// ============================================================
		onUploadVC:function(oEvent){
		  this._uploadJSON();  
		},
		// ============================================================
		// Calculate message and status
		// ============================================================
		_reconVC:function(oRec){
		   oRec.STATUS=true;
		   oRec.MESSAGE="";
		   if(oRec.DATA_TYPE_NAME_BACKUP!==oRec.DATA_TYPE_NAME_SYSTEM){
		       oRec.STATUS=false;
		       oRec.MESSAGE+="/DataType Mismatch";
		   }
		   if(oRec.LENGTH_BACKUP!==oRec.LENGTH_SYSTEM){
		       oRec.STATUS=false;
		       oRec.MESSAGE+="/Length Mismatch";
		   }
		   if(oRec.SCALE_BACKUP!==oRec.SCALE_SYSTEM){
		       oRec.STATUS=false;
		       oRec.MESSAGE+="/Scale Mismatch";
		   }
		   if(oRec.GENERATED_ALWAYS_AS_BACKUP!==oRec.GENERATED_ALWAYS_AS_SYSTEM){
		       oRec.STATUS=false;
		       oRec.MESSAGE+="/Definition Mismatch";
		   }
		},
		// ============================================================
		// Format function to color the icon based on status                                     
		// ============================================================
		formatStatusIconColor: function(oValue) {
            return oValue?"#00FF00":"#FF0000";
		},
		// ============================================================
		// Generic search                                     
		// ============================================================
		onSearchData:function(oEvent){
			var sQuery = this.getView().byId("inputSearch").getValue();
			var sSchema=this.getView().byId("selectSchema").getSelectedKey();
			var sMatch = this.getView().byId("selectStatus").getSelectedKey();
     		var aFilter = [];
			if (sQuery) {
				aFilter.push(new Filter({
                        filters: [
                          new Filter({
                            path: 'SCHEMA_NAME_BACKUP',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          }),
                          new Filter({
                            path: 'TABLE_NAME_BACKUP',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          }),
                          new Filter({
                            path: 'COLUMN_NAME_BACKUP',
                            operator: FilterOperator.Contains,
                            value1: sQuery
                          })
                        ],
                        and: false
                      }));
			}
			if(sSchema!=="ALL_SCHEMA"){
			    aFilter.push(new Filter("SCHEMA_NAME_BACKUP", FilterOperator.EQ, sSchema));
			}
			if(sMatch==="YES"){
		        aFilter.push(new Filter("STATUS", FilterOperator.EQ, true));
			}else if(sMatch==="NO"){
			    aFilter.push(new Filter("STATUS", FilterOperator.EQ, false));
			}
			var oFilter=null;
			if(aFilter.length!==0){
			    oFilter=new Filter({
                        filters: aFilter,
                        and: true
                      });
			}
		    this.getView().byId("tableVC").getBinding("items").filter(oFilter, "Application");
		    if(oEvent.getParameter("id").indexOf("selectStatus")!==-1){
		        var bFilter = sMatch==="YES"?true:false;
		        var oData = this.getView().getModel("vc").getData();
		        var oFilterData = [];
		        if(sMatch==="YES"||sMatch==="NO"){
		           oFilterData = jQuery.grep(oData,function(obj){
		                return obj.STATUS===bFilter;
		            }); 
		        }else{
		           oFilterData =  oData;
		        }
		        var aUniqueSchema=this._getUniqueSchema(oFilterData);
                this.getView().getModel("sc").setData(aUniqueSchema);
		    }
		},
		// ============================================================
		// Show details for Virtual columns                                    
		// ============================================================
		onRowSelect:function(oEvent){
		    var sPath = oEvent.getParameter("listItem").oBindingContexts.vc.sPath;
		    var vcData = this.getView().getModel("vc").getProperty(sPath);
            var appModel=this.getOwnerComponent().getModel("app");
            //window.console.log(vcData);
            appModel.setProperty("/data/vc_detail",vcData);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("detailVC");
		}
	});
});