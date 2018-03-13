sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, JSONModel, ODataModel, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("dk.sample.controller.Home", {
        // ============================================================
        // Initialize
        // ============================================================
        onInit: function () {
            //this._changeData("1000","","2014W01");
            google.charts.load('current', {
                'packages': ['geochart'],
                'mapsApiKey': 'AIzaSyCAtGk7zdXtuM6xzsIflk_ZyOl0H0fJnAE'
            });
            var oThis = this;
            google.charts.setOnLoadCallback(function () {
                oThis.chart = new google.visualization.GeoChart(oThis.getView().byId("geo_chart_canvas").getDomRef());
                oThis.onChangeData();
            });
        },
        _changeData: function (sStore, sKPI, sPeriod) {
            var oModel = this.getOwnerComponent().getModel("sales");
            var aFilters = [];
            var data = [];
            var oThis = this;
            aFilters.push(new Filter("PHY_STORE_NO", FilterOperator.EQ, sStore));
            aFilters.push(new Filter("CA_FISCPER_Z5", FilterOperator.EQ, sPeriod));
            oModel.read("/Sales", {
                filters: aFilters,
                success: function (oData, oResponse) {
                    var aData = [];
                    var total = 0
                    $.each(oData.results, function (indexInArray, elem) {
                        if (sKPI === "AMOUNT") {
                            total = total + parseFloat(elem.AMOUNT);
                        } else {
                            total = total + parseInt(elem.CM_COUNT);
                        }
                    });
                    $.each(oData.results, function (indexInArray, elem) {
                        var rec = [];
                        rec.push(elem.COUNTRY);
                        if (sKPI === "AMOUNT") {
                            var perc1 = String(Math.ceil(parseFloat(elem.AMOUNT) / total * 100))
                                + "% of Total Amount";
                            rec.push(parseFloat(elem.AMOUNT));
                            rec.push(perc1);
                        } else {
                            var perc2 = String(Math.ceil(parseFloat(elem.CM_COUNT) / total * 100))
                                + "% of Total Count";
                            rec.push(parseInt(elem.CM_COUNT));
                            rec.push(perc2);
                        }
                        aData.push(rec);
                    });
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn('string', 'Country');
                    dataTable.addColumn('number', sKPI === "AMOUNT" ? "Amount" : "Count");
                    dataTable.addColumn({ type: 'string', role: 'tooltip' });
                    dataTable.addRows(aData);
                    oThis.options = { colorAxis: { colors: ['yellow', 'green'] } };
                    oThis.chart.draw(dataTable, oThis.options);
                    //window.console.log(google.visualization.arrayToDataTable(data));
                },
                error: function (oError) {
                    window.console.log(oError);
                }
            });
        },
        onChangeData: function (oEvent) {
            var sKPI = this.getView().byId("selectKPI").getSelectedKey();
            var sPeriod = this.getView().byId("selectPeriod").getSelectedKey();
            var sStore = this.getView().byId("selectStore").getSelectedKey();
            this._changeData(sStore, sKPI, sPeriod)
        },
        onGoPage1: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("page_1");
        }

    });
});
