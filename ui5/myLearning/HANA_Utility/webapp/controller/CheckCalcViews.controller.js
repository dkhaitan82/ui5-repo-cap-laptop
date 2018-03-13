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
	return Controller.extend("burberry.hana.util.controller.CheckCalcViews", {
	    
	    // ============================================================
		// Initialize                                     
		// ============================================================
		onInit: function() {
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "pa");
			this._readViews();

		},
		// ============================================================
		// Helper Function to get resources                                       
		// ============================================================		
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		
		// ============================================================
		// NOT USED                                       
		// ============================================================
		onOpenPackageDialog: function() {
			this._buildTree();
			this.getView().byId("ChoosePackageDialog").open();
		},
		/* ============================================================ */
		/* Initial view retrieval from HANA backend.                                              */
		/* ============================================================ */
		_readViews:function(){
		    
		    var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.viewList");
			var oModel = new ODataModel(sURL);
			var oThis = this;
			var oFlatModel = new JSONModel();
			this.getView().setModel(oFlatModel,"fl");
			oModel.read("/Views",{
			    success:function(oData,response){
			        jQuery.each(oData.results,function(index,obj){
			            obj.SUCCESS_COUNT=0;
			            obj.ERROR_COUNT=0;
			            obj.EXEC_COUNT=0;
			            obj.MESSAGE="";
			        });
			        oThis.getView().getModel("fl").setData(oData);
			        oThis._buildTree(oData.results);
			    },
			    error:function(oError){
			        window.console.log(oError);
			    }
			});
		},
		/* ============================================================ */
		/* Initialize the tree control                                              */
		/* ============================================================ */
		/**
		 * @private
		 */
		_buildTree: function(inputArray) {
			var nodes = [];
			var aData=inputArray.filter(function(obj){return obj.AUTO_EXEC===1;});
			for(var i in aData){
        		var currNode = nodes;
        		var sViewName=aData[i].VIEW_NAME.replace("/",".");
            	var aFold=sViewName.split(".");
                var folderId="";
                for(var j in aFold){
                	var idx = currNode.findIndex(function(obj){return obj.folder===aFold[j];});
                	var oTreeObj={};
                    if(idx===-1){
                        oTreeObj.folder=aFold[j];
        				if(j<(aFold.length-1)){
        					oTreeObj.nodes=[];
        					folderId += "."+aFold[j];
        				}else{
        				    folderId += "/"+aFold[j];
        				    oTreeObj.msg="";
        				}
        				oTreeObj.folder_id = folderId.substr(1);
        				oTreeObj.view_count=1;
        				oTreeObj.success_count=0;
        				oTreeObj.error_count=0;
                        idx = currNode.length;
                        currNode.push(oTreeObj);
                        currNode = currNode[idx].nodes;
                    }else{
                        folderId+="."+aFold[j];
                        currNode[idx].view_count += 1;
                    	currNode = currNode[idx].nodes;
                    }
                }
            }
            this.getView().getModel("pa").setData(nodes);
            this.getView().byId("PackageTree").collapseAll();
            
		},
		// ============================================================
		// Update tree with execution status                                        
		/// ============================================================ 
		/**
		 * @private
		 */
		_updateTree:function(sView,sMsg,sType){
		    var oFlatModel = this.getView().getModel("fl").getData();
		    jQuery.each(oFlatModel.results,function(index,obj){
		        if(obj.VIEW_NAME===sView){
		            obj.EXEC_COUNT = 1;
		            obj.MESSAGE = sMsg;
		            if(sType==="SUCCESS"){
		                obj.SUCCESS_COUNT = 1;
		            }else{
		                obj.ERROR_COUNT = 1;
		            }
		        }
		    });
		    var currNode = this.getView().getModel("pa").getData();
		    var sViewName=sView.replace("/",".");
		    var aFold=sViewName.split(".");
		    var idxLastFolder = aFold.length -1;
		    for(var j in aFold){
		        var idx = currNode.findIndex(function(obj){return obj.folder===aFold[j];});
		        if(idx!==-1){
		            if(sType==="SUCCESS"){
		                currNode[idx].success_count +=1;
		            }else{
		                currNode[idx].error_count +=1;
		            }
		            if(j==idxLastFolder){
		                currNode[idx].msg=sMsg;
		            }
		            currNode = currNode[idx].nodes;
		        }
		    }
		    this.getView().getModel("pa").refresh();

		},
		// ============================================================
		// This event function is not used from view. 
		// written to test row selection from tree table                                  
		// ============================================================ 
		onPackageSelect: function() {
			this.getView().byId("ChoosePackageDialog").close();
			var index = this.getView().byId("PackageTree").getSelectedIndex();
			var context = this.getView().byId("PackageTree").getContextByIndex(index);
			var oModel = this.getView().getModel("pa");
			var sVal = oModel.getProperty(context.getPath()+"/folder_id");
			window.console.log(sVal);
		},
		// ============================================================
		// Initialize entire view.. 
		// This method is called while pressing refresh button from UI                  
		// ============================================================ 
		onResetAll:function(oEvent){
		   this.onInit();
		},
		// ============================================================
		// Formatter 
		// Icon colour to green while success else grey                   
		// ============================================================
		formatSuccessColor:function(oValue){
		   return oValue?"#00ff00":"#c2d6d6"; 
		},
		// ============================================================
		// Formatter 
		// Icon colour to red while success else grey                   
		// ============================================================
		formatErrorColor:function(oValue){
		   return oValue?"#ff3300":"#c2d6d6"; 
		},
		// ============================================================
		// Formatter 
		// formatting columns with more than one statuses                  
		// ============================================================
		formatCount:function(oValue){
		    var cnt=parseInt(oValue);
		    if(cnt===0||cnt===1){
		        return "";
		    }else{
		        return "("+oValue+")";
		    }
		},
		// ============================================================
		// Helper function 
		// This function is used to build flat array of objects 
		// to be used while actual execution                  
		// ============================================================
		_getExecutionList:function(){
		    var oTree=this.getView().byId("PackageTree");
		    var oTreeModel = this.getView().getModel("pa");
		    var oFlatData = this.getView().getModel("fl").getData().results;
		    var aIdx = oTree.getSelectedIndices();
		    var aPaths=[];
		    var aViewID=[];
		    var aSelViews = [];
		    if(aIdx.length!==0){
		        //Get tree paths
		        for(var i in aIdx){
		            aPaths.push(oTree.getContextByIndex(aIdx[i]));
		        }
		        i=0;
		        //Get Node Ids from tree
		        for(i in aPaths){
		           var sViewID=oTreeModel.getProperty(aPaths[i]+"/folder_id");
		           aViewID.push(sViewID);
		        }
		        i=0;
		        var aTempViews = [];
		        //Get view names from view ids
		        for(i in aViewID){
		            var atemp = [];
		            atemp=jQuery.grep(oFlatData,function(obj){
		               return (obj.VIEW_NAME.startsWith(aViewID[i])) && (obj.AUTO_EXEC===1) && (obj.ERROR_COUNT===0) && (obj.SUCCESS_COUNT===0); 
		            });
		            jQuery.each(atemp,function(idx,obj){
		                aTempViews.push(obj);
		            });
		        }
		        //remove duplicates
		        jQuery.each(aTempViews,function(index,obj1){
		            var at=jQuery.grep(aSelViews,function(obj2){
		                return obj1.VIEW_NAME===obj2.VIEW_NAME;
		            });
		            if(at.length===0){
		               aSelViews.push(obj1); 
		            }
		        });
		    }else{
		        MessageToast.show("Please select a row");
		    }
		    return aSelViews;
		},
		// ============================================================
		// Event function
		// This function is called while pressing execute button from UI                  
		// ============================================================
		onExecuteViews:function(oEvent){
		   var aSelViews = this._getExecutionList();
		   var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
		   var sURL = sOrigin + this._getResData("xsjs.executeTestCase");
		   var oThis = this;
		   var cnt=0;
		   
		   if(aSelViews.length===0){
		       return;
		   }
		   jQuery.each(aSelViews,function(index,obj){
		      var sSQL = 'SELECT SUM(1) AS "C1" FROM "_SYS_BIC"."'+obj.VIEW_NAME+'" WHERE 1=2';
		      jQuery.ajax({
		          url: sURL,
		          method: "POST",
		          dataType: "json",
		          contentType: "application/json",
		          data: sSQL,
		          async: true,
		          success: function(output) {
		              var oModel = new sap.ui.model.json.JSONModel(output);
					  var objOutput = oModel.getData();
					  if(objOutput.RET_CODE===0||objOutput.RET_CODE==="0"){
					     oThis._updateTree(obj.VIEW_NAME,objOutput.MESSAGE,"SUCCESS"); 
					  }else{
					      var aMsg = [];
					      if(objOutput.MESSAGE.indexOf("invalidated")!==-1){
					          aMsg=objOutput.MESSAGE.split(":");
					          if(aMsg.length>1){
					              oThis._updateTree(obj.VIEW_NAME,aMsg[1],"ERROR"); 
					          }else{
					              oThis._updateTree(obj.VIEW_NAME,objOutput.MESSAGE,"ERROR"); 
					          }
					      }else{
					          oThis._updateTree(obj.VIEW_NAME,objOutput.MESSAGE,"ERROR"); 
					      }
					      
					  }
					 
		          },
		          error: function(err) {
		              oThis._updateTree(obj.VIEW_NAME,err.responseText,"ERROR");
		              window.console.error(sSQL);
		              window.console.error(err.responseText);
		          },
		          beforeSend:function(){
		          }
		      });
		       
		   });
		   
		}
		
	});
});