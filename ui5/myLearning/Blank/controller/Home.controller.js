sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel"
 ], function(Controller, MessageToast, JSONModel, ODataModel) {
     "use strict";
     return Controller.extend("dk.sample.controller.Home", {
       // ============================================================
         // Initialize
         // ============================================================
         onInit: function() {
 
         },
         // ============================================================
         // Open Jobs Email alert view
         // ============================================================
         onPage1: function(oEvent) {
             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
             oRouter.navTo("page_1");
         }
     });
 });