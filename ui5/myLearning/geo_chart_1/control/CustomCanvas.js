sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("dk.sample.control.CustomCanvas", {
		metadata : {
            properties : {
                //width: 	{type : "sap.ui.core.CSSSize", defaultValue : "400px"},
                //height: {type : "sap.ui.core.CSSSize", defaultValue : "200px"}
                //test:{type:"string",defaultValue:"Debasish"}
			}
		},
		init : function () {
		},
		renderer : function (oRm, oControl) {
            //oRm.write("<div"); 
            //oRm.writeControlData(oControl);
            //oRm.addStyle("width", oControl.getProperty('width'));
            //oRm.addStyle("height", oControl.getProperty('height'));
            //oRm.writeStyles();
            //oRm.write(">");
            //oRm.write("<canvas width='" + oControl.getProperty('width') + "' " + "height='" + oControl.getProperty('height') + "'");
            oRm.write("<canvas");
            oRm.writeControlData(oControl);  // writes the Control ID and enables event handling - important!
            //window.console.log(oControl);
            //oRm.addStyle("width", oControl.getProperty('width'));  // write the Control property size; the Control has validated it to be a CSS size
            //oRm.addStyle("height", oControl.getProperty('height'));
            //oRm.writeStyles();
            //window.console.log(oControl.getProperty("test"));
            //oControl.setProperty("test","Khaitan");
            //window.console.log(oControl.getProperty("test"));
            oRm.write("></canvas>");
            //oRm.write("</div>");
		}
	});
});