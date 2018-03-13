sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("dk.sample.control.CustomSVG", {
		metadata : {
            properties : {
			}
		},
		init : function () {
            window.console.log("Init");
        },
        onAfterRendering:function(){
            window.console.log(this.getParent().getProperties());
        },
		renderer : function (oRm, oControl) {
            window.console.log("renderer")
            oRm.write("<SVG");
            oRm.writeControlData(oControl); 
            oRm.write("></SVG>");
		}
	});
});