sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel"
], function (Controller, MessageToast, JSONModel, ODataModel) {
    "use strict";
    return Controller.extend("dk.sample.controller.Home", {
        // ============================================================
        // Initialize
        // ============================================================
        onInit: function () {
            var oVizFrame = this.getView().byId("idcolumn");
            var oModel = new sap.ui.model.json.JSONModel();
            var data = {
                'Cars': [
                    { "Model": "Alto", "Value": "758620" },
                    { "Model": "Zen", "Value": "431160" },
                    { "Model": "Santro", "Value": "515100" },
                    { "Model": "Matiz", "Value": "293780" },
                    { "Model": "Wagan R", "Value": "974010" },
                ]
            };
            oModel.setData(data);
            var oDataset = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: 'Model',
                    value: "{Model}"
                }],

                measures: [{
                    name: 'Cars Bought',
                    value: '{Value}'
                }],

                data: {
                    path: "/Cars"
                }
            });
            oVizFrame.setDataset(oDataset);
            oVizFrame.setModel(oModel);
            oVizFrame.setVizType('bar');
            oVizFrame.setVizProperties({
                plotArea: {
                    colorPalette: d3.scale.category20().range()
                }
            });
            
            var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                'uid': "valueAxis",
                'type': "Measure",
                'values': ["Cars Bought"]
            }),
                feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    'uid': "categoryAxis",
                    'type': "Dimension",
                    'values': ["Model"]
                });
            oVizFrame.addFeed(feedValueAxis);
            oVizFrame.addFeed(feedCategoryAxis);
            
        },
        // ============================================================
        // Open Jobs Email alert view
        // ============================================================
        onPage1: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("page_1");
        },
        onShowPie:function(oEvent){
            var oVizFrame = this.getView().byId("idcolumn");
            oVizFrame.setVizType('pie');
        },
        onShowBar:function(oEvent){
            var oVizFrame = this.getView().byId("idcolumn");
            oVizFrame.setVizType('bar');
        }
    });
});