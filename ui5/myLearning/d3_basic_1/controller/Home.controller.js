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


        },
        onAfterRendering: function () {
            var sDiv = this.getView().byId("d3").getId();
            sDiv = "#" + sDiv;
            var div = $(sDiv);
            var iWidth = parseInt(div.width()) / 2;
            var iHeight = 500;
            this.svgContainer = d3.select(sDiv).append("svg")
                                    .attr("width",iWidth)
                                    .attr("height",iHeight);
            var circleData = [
                { "cx": 20, "cy": 20, "radius": 20, "color" : "green" },
                { "cx": 70, "cy": 70, "radius": 20, "color" : "purple" }];
              
              
              var rectangleData = [
                { "rx": 110, "ry": 110, "height": 30, "width": 30, "color" : "blue" },
                { "rx": 160, "ry": 160, "height": 30, "width": 30, "color" : "red" }];
              

             
             var circles = this.svgContainer.selectAll("circle")
                                        .data(circleData)
                                        .enter()
                                        .append("circle")
                                        .on("click",function(d){
                                            d3.select(this).transition()
                                                .ease(d3.easeLinear)
                                                .duration(2000)
                                                .style("fill","red")
                                                .attr("cy",400);

                                        })
                                        .on("mouseover",function(d){
                                            d3.select(this).transition()
                                                .ease(d3.easeLinear)
                                                .duration(2000)
                                                .style("fill",function(d1){return d1.color;})
                                                .attr("cy",function(d1){return d1.cy});

                                        });
             
             var circleAttributes = circles
                                     .attr("cx", function (d) { return d.cx; })
                                     .attr("cy", function (d) { return d.cy; })
                                     .attr("r", function (d) { return d.radius; })
                                     .style("fill", function (d) { return d.color; });
             
             var rectangles = this.svgContainer.selectAll("rect")
                                          .data(rectangleData)
                                          .enter()
                                          .append("rect")
                                          .on("mouseover",function(d){
                                            d3.select(this)
                                              .style("fill","white");
                                            
                                          })
                                          .on("mouseout",function(d){
                                              d3.select(this).style("fill",d.color)
                                          }); 
                                         
             var rectangleAttributes = rectangles
                                        .attr("x", function (d) { return d.rx; })
                                        .attr("y", function (d) { return d.ry; })
                                        .attr("height", function (d) { return d.height; })
                                        .attr("width", function (d) { return d.width; })
                                        .style("fill", function(d) { return d.color; });
        },
        // ============================================================
        // Open Jobs Email alert view
        // ============================================================
        onPage1: function (oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("page_1");
        }
    });
});