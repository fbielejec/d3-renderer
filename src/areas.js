/**
 * @fbielejec
 */

// ---MODULE IMPORTS---//
var d3 = require('d3');
 require("script!./d3-legend.js");

var utils = require('./utils.js');
var global = require('./global.js');

 require("imports?$=jquery!./jquery.simple-color.js");

// ---MODULE VARIABLES---//

var areasLayer;

var areaDefaultColorIndex = 1;
var areaStartColor = global.pairedSimpleColors[0];
var areaEndColor = global.pairedSimpleColors[global.pairedSimpleColors.length - 1];
var polygonOpacity = 0.3;

// ---MODULE EXPORTS---//

var exports = module.exports = {};

exports.generateAreasLayer = function(areas_, areaAttributes) {

	areasLayer = global.g.append("g").attr("class", "areasLayer");

	var areas = areasLayer.selectAll("area").data(areas_).enter().append(
			"polygon") //
	.attr("class", "area") //
	.attr("startTime", function(d) {

		return (d.startTime);

	}) //
	.attr("points", function(d) {

		var polygon = d.polygon;
		return polygon.coordinates.map(function(d) {

			xy = global.projection([ d.xCoordinate, // long
			d.yCoordinate // lat
			]);

			return [ xy[0], // long
			xy[1] // lat
			].join(",");

		}).join(" ");
	}) //
	.attr("fill", global.fixedColors[areaDefaultColorIndex]) //
	.attr("fill-opacity", polygonOpacity) //
	.attr("visibility", "visible") //
	.on('mouseover', function(d) {

		var area = d3.select(this);
		area.attr('stroke', '#000').attr("stroke-width", "0.5px") //

	}) //
	.on('mouseout', function(d, i) {

		var area = d3.select(this);
		area.attr('stroke', null).attr("stroke-width", null) //
	});

	
	// dump attribute values into DOM
	areas[0].forEach(function(d, i) {

		var thisArea = d3.select(d);

		var properties = areas_[i].attributes;
		for ( var property in properties) {
			if (properties.hasOwnProperty(property)) {

				thisArea.attr(property, properties[property]);

			}
		}// END: properties loop
	});
	
	
	
}// END: generateAreasLayer

exports.updateAreasLayer = function(value) {

	// ---select areas yet to be displayed---//

	areasLayer.selectAll(".area") //
	.filter(
			function(d) {
				var polygon = this;
				var startDate = utils.formDate(
						polygon.attributes.startTime.value).getTime();

				return (value < startDate);
			}) //
	.transition() //
	.ease("linear") //
	.attr("visibility", "hidden");

	// ---select polygons displayed now---//

	areasLayer.selectAll(".area") //
	.filter(
			function(d) {
				var polygon = this;
				var startDate = utils.formDate(
						polygon.attributes.startTime.value).getTime();

				return (value >= startDate);
			}) //
	.transition() //
	.ease("linear") //
	.attr("visibility", "visible");

}// END: updateAreasLayer

exports.setupPanels = function(attributes) {

	setupAreasLayerCheckbox();
	setupAreaFixedColorPanel();
	setupAreaColorAttributePanel(attributes);
	
	
	
	
	
}// END: setupPanels

setupAreaColorAttributePanel = function(attributes) {
	
	// attribute
	var areaColorAttributeSelect = document.getElementById("areaColorAttribute");

	for (var i = 0; i < attributes.length; i++) {

		var option = attributes[i].id;
		// skip points with count attribute
		if (option == global.COUNT) {
			continue;
		}

		var element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		areaColorAttributeSelect.appendChild(element);

	}// END: i loop
	
	// area color listener
	d3
			.select(areaColorAttributeSelect)
			.on(
					'change',
					function() {

						var colorAttribute = areaColorAttributeSelect.options[areaColorAttributeSelect.selectedIndex].text;

						var attribute = utils.getObject(attributes, "id",
								colorAttribute);

						var data;
						var scale;

						$('#areaStartColor').html('');
						$('#areaEndColor').html('');
						
						
						if (attribute.scale == global.ORDINAL) {

							data = attribute.domain;
							scale = d3.scale.ordinal().range(global.ordinalColors)
									.domain(data);

							updateAreaColorLegend(scale);

						} else if (attribute.scale == global.LINEAR) {

							data = attribute.range;
							scale = d3.scale.linear().domain(data).range(
									[ areaStartColor, areaEndColor ]);

							updateAreaColorLegend(scale);

							// start color
							$('#areaStartColor').html("<h4>Start color<\/h4>");
							$('#areaStartColor').append(
									"<input class=\"areaStartColor\" \/>");

							$('.areaStartColor')
									.simpleColor(
											{
												cellWidth : 13,
												cellHeight : 13,
												columns : 4,
												displayColorCode : true,
												colors : utils
														.getSimpleColors(global.pairedSimpleColors),

												onSelect : function(hex,
														element) {

													areaStartColor = "#" + hex;
													
													scale.range([
															areaStartColor,
															areaEndColor ]);
													
													updateAreaColorLegend(scale);

													// trigger repaint
													updateAreaColors(scale,
															colorAttribute);

												}// END: onSelect
											});

							$('.areaStartColor').setColor(areaStartColor);

							// end color
							$('#areaEndColor').html("<h4>End color<\/h4>");
							$('#areaEndColor').append(
									"<input class=\"areaEndColor\" \/>");

							$('.areaEndColor')
									.simpleColor(
											{
												cellWidth : 13,
												cellHeight : 13,
												columns : 4,
												colors : utils
														.getSimpleColors(global.pairedSimpleColors),
												displayColorCode : true,
												onSelect : function(hex,
														element) {

													areaEndColor = "#" + hex;
													
													scale.range([
															areaStartColor,
															areaEndColor ]);
													
													updateAreaColorLegend(scale);

													// trigger repaint
													updateAreaColors(scale,
															colorAttribute);
												}
											});

							$('.areaEndColor').setColor(areaEndColor);
							
						} else {
							
							console
							.log("Error occured when resolving scale type!");
							
						}// END: range/domain check

						// trigger repaint
						updateAreaColors(scale, colorAttribute);
						
						
					});
	
}//END: setupAreaColorAttributePanel


updateAreaColorLegend = function(scale) {
	
	
	var width = 150;
	var height = 110;

	var margin = {
		left : 20,
		top : 20
	};

	$('#areaColorLegend').html('');
	var svg = d3.select("#areaColorLegend").append('svg').attr("width", width)
			.attr("height", height);

	var areaColorLegend = d3.legend.color().scale(scale).shape('circle')
			.shapeRadius(5).shapePadding(10).cells(5).orient('vertical')

	svg.append("g").attr("class", "areaColorLegend").attr("transform",
			"translate(" + (margin.left) + "," + (margin.top) + ")").call(
					areaColorLegend);
	
	
}//END: updateAreaColorLegend

updateAreaColors = function(scale, colorAttribute) {
	
	console.log(scale.range());
	console.log(scale.domain());
	console.log("ca: " + colorAttribute);
	
	areasLayer.selectAll(".area").transition() //
	.ease("linear") //
	.attr("fill", function() {

		var area = d3.select(this);
		var attributeValue = area.attr(colorAttribute);
		
//		console.log(attributeValue);
		
		var color = scale(attributeValue);

		if (attributeValue == null) {
			console.log("null found");
			color = "#000";
		}

		return (color);
	});
	
}//END: updateAreaColors

setupAreaFixedColorPanel = function() {

	var areaFixedColorSelect = document.getElementById("areaFixedColor");
	var scale = utils.alternatingColorScale().domain(global.fixedColors).range(
			global.fixedColors);

	for (var i = 0; i < global.fixedColors.length; i++) {

		var option = global.fixedColors[i];
		var element = document.createElement("option");
		element.textContent = option;
		element.value = option;

		areaFixedColorSelect.appendChild(element);

	}// END: i loop

	// select the default
	areaFixedColorSelect.selectedIndex = areaDefaultColorIndex;

	// area fixed color listener
	d3
			.select(areaFixedColorSelect)
			.on(
					'change',
					function() {

						var colorSelect = areaFixedColorSelect.options[areaFixedColorSelect.selectedIndex].text;
						var color = scale(colorSelect);

						areasLayer.selectAll(".area") //
						.transition() //
						.ease("linear") //
						.attr("fill", color);

						// setup legend
						updateAreaFixedColorLegend(scale);
						
					});
	
}// END: setupAreaFixedColorPanel


updateAreaFixedColorLegend = function(scale) {
	
	var width = 150;
	var height = 265;

	var margin = {
		left : 20,
		top : 20
	};

	$('#areaFixedColorLegend').html('');
	var svg = d3.select("#areaFixedColorLegend").append('svg').attr("width",
			width).attr("height", height);

	// TODO: polygonal shape
	var areaFixedColorLegend = d3.legend.color().scale(scale).shape('circle')
			.shapeRadius(5).shapePadding(10).cells(5).orient('vertical')

	svg.append("g").attr("class", "areaFixedColorLegend").attr("transform",
			"translate(" + (margin.left) + "," + (margin.top) + ")").call(
					areaFixedColorLegend);
	
	
}//END: updateAreaFixedColorLegend

setupAreasLayerCheckbox = function() {

	$('#layerVisibility')
			.append(
					"<input type=\"checkbox\" id=\"areasLayerCheckbox\"> Polygons layer<br>");

	var areasLayerCheckbox = document.getElementById("areasLayerCheckbox");
	// default state is checked
	areasLayerCheckbox.checked = true;

	d3.select(areasLayerCheckbox).on("change", function() {

		if (this.checked) {
			// remove style, then visibility is driven by the time-based
			// selections
			areasLayer.selectAll(".area").style("visibility", null);
		} else {
			// style is superior to attribute, make them hidden
			areasLayer.selectAll(".area").style("visibility", "hidden");
		}

	});

}// END: setupAreasLayerCheckbox

// ---MODULE PRIVATE FUNCTIONS---//
