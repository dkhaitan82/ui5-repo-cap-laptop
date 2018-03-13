sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel"
], function (Controller, MessageToast, JSONModel, ODataModel) {
	"use strict";
	return Controller.extend("dk.sample.controller.Page1", {
		// ============================================================
		// Initialize
		// ============================================================
		onInit: function () {

		},
		onAfterRendering: function () {
			var graph = {
				nodes: [
					{
						name: "Debasish",
						group: 1
					},
					{
						name: "Chandan",
						group: 2
					},
					{
						name: "Sohini",
						group: 2
					},
					{
						name: "Anu",
						group: 2
					}
				],
				links: [
					{
						source: 0,
						target: 1,
						value: 4
					},
					{
						source: 0,
						target: 2,
						value: 4
					},
					{
						source: 0,
						target: 3,
						value: 4
					}
				]
			};
			var width = 500,
				height = 500;
			//var color = d3.scale.category20();
			var force = d3.layout.force()
				.charge(-120)
				.linkDistance(30)
				.size([width, height]);
			var sDiv = this.getView().byId("d3").getId();
			sDiv = "#" + sDiv;
			var svg = d3.select(sDiv).append("svg")
				.attr("width", width)
				.attr("height", height);
			var force = d3.layout.force()
				.charge(-120)
				.linkDistance(60)
				.size([width, height]);
			force.nodes(graph.nodes)
				.links(graph.links)
				.start();
			var link = svg.selectAll(".link")
				.data(graph.links)
				.enter()
				.append("line")
				.attr("class", "link")
				.style("marker-end", "url(#end)");
			var node = svg.selectAll(".node")
				.data(graph.nodes)
				.enter().append("g")
				.attr("class", "node")
				.call(force.drag);
			node.append("circle")
				.attr("r", 8)
				.style("fill", function (d) {
					return "yellow";
				})
			node.append("text")
				.attr("dx", 10)
				.attr("dy", ".35em")
				.text(function (d) { return d.name })
				.style("stroke", "gray");
			//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
			force.on("tick", function () {
				link.attr("x1", function (d) {
					return d.source.x;
				})
					.attr("y1", function (d) {
						return d.source.y;
					})
					.attr("x2", function (d) {
						return d.target.x;
					})
					.attr("y2", function (d) {
						return d.target.y;
					});
				d3.selectAll("circle").attr("cx", function (d) {
					return d.x;
				})
					.attr("cy", function (d) {
						return d.y;
					});
				d3.selectAll("text").attr("x", function (d) {
					return d.x;
				})
					.attr("y", function (d) {
						return d.y;
					});
			});

			svg.append("defs").selectAll("marker")
				.data(["end"])
				.enter().append("marker")
				.attr("id", function (d) { return d; })
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 25)
				.attr("refY", 0)
				.attr("markerWidth", 6)
				.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("path")
				.attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
				.style("stroke", "#4679BD")
				.style("opacity", "0.6");
		},
		// ============================================================
		// Open Jobs Email alert view
		// ============================================================
		onNavBack: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
		}
	});
});
