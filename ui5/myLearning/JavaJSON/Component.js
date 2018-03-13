sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/v2/ODataModel",
   "sap/ui/model/resource/ResourceModel"
], function(UIComponent, JSONModel, ODataModel,ResourceModel) {
	"use strict";
	return UIComponent.extend("dk.sample.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		}

	});
});
