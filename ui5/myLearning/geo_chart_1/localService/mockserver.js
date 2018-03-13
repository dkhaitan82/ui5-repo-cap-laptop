sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";
	return {
		init: function () {
			// create
			var oMockServer = new MockServer({
				rootUri: "/CustSales/"
			}); 
			var oUriParameters = jQuery.sap.getUriParameters();
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: oUriParameters.get("serverDelay") || 10
			});
			// simulate
			var sPath = jQuery.sap.getModulePath("dk.sample.localService");
			oMockServer.simulate(sPath + "/metadata.xml", sPath + "/data");
			// start
			oMockServer.start();
		}
	};
});