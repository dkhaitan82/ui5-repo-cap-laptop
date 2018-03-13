sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, JSONModel, ODataModel,Filter,FilterOperator) {
	"use strict";
	return Controller.extend("dk.sample.controller.Page1", {
		// ============================================================
		// Initialize
		// ============================================================
		onInit: function () {
			
		},
		// ============================================================
		// Adding Canvas element once page is rendered
		// ============================================================
		onAfterRendering:function(){
			//this.getView().byId("chart_html").setContent("<canvas id='chart_canvas' width='900' height='700'></canvas>");
			var color = Chart.helpers.color;
			this.barChartData = {
				labels: [],
				datasets: [{
					backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                	borderColor: window.chartColors.red,
					label: '',
					data: []
				}]
			};
			this.myBar = new Chart(this.getView().byId("chart_canvas").getDomRef(), {
                type: 'bar',
                data: this.barChartData,
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Burberry Store World View'
					},
					onClick:function(c,i){
						var e = i[0];
						 window.console.log(e._index)
						var x_value = this.data.labels[e._index];
						var y_value = this.data.datasets[0].data[e._index];
						window.console.log(x_value);
						window.console.log(y_value);
			  
					   }
                }
			});

		},
		// ============================================================
		// Go Back Home view
		// ============================================================
		onNavBack: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
		},
		// ============================================================
		// Chart is drawn on Demo Data
		// ============================================================
		loadChart:function(aLabel,aData){
			
			
           
		},
		onChangeData: function (oEvent) {
			var sKPI = this.getView().byId("selectKPI").getSelectedKey();
            var sPeriod = this.getView().byId("selectPeriod").getSelectedKey();
            var sStore = this.getView().byId("selectStore").getSelectedKey();
			var aFilters = [];
			var oThis = this;
			var oModel = this.getOwnerComponent().getModel("sales");
            aFilters.push(new Filter("PHY_STORE_NO", FilterOperator.EQ, sStore));
            aFilters.push(new Filter("CA_FISCPER_Z5", FilterOperator.EQ, sPeriod));
            oModel.read("/Sales", {
                filters: aFilters,
                success: function (oData, oResponse) {
					var aData = [];
					var aLabel=[];
					var allData=[];
                    $.each(oData.results, function (indexInArray, elem) {
						var oData={};
                        oData.label=elem.COUNTRY;
                        if (sKPI === "AMOUNT") {
                            oData.kpi=parseFloat(elem.AMOUNT)
                        } else {
                            oData.kpi=parseInt(elem.CM_COUNT)
						}
						allData.push(oData);
					});
					allData.sort(function(a,b){
						return b.kpi-a.kpi;
					});
					var iCount = 0
					if(allData.length>10){
						iCount=10;
					}else{
						iCount = allData.length;
					}
					for(var i=0; i<iCount;i++){
						aLabel.push(allData[i].label);
						aData.push(allData[i].kpi);
					}
					oThis.barChartData.labels=aLabel;
					oThis.barChartData.datasets[0].data=aData;
					oThis.myBar.update();
                    //oThis.loadChart(aLabel,aData);
                    //window.console.log(google.visualization.arrayToDataTable(data));
                },
                error: function (oError) {
                    window.console.log(oError);
                }
            });
		}
	});
});
