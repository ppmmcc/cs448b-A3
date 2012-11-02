// Set namespace
var app = {};

// Map Width
app.width = 1200;
app.height = 600;

// Normalize the total number of Applicants
app.SELECTED_CIRCLE_SIZE = 60;
app.MAX_CIRCLE_SIZE = 50;
app.MAX_APPLICANTS = 6000;
app.MIN_CIRCLE_SIZE = 10;
app.TEXT_Y_OFFSET = 5; // Text offset from a circle's centroid

// Color Array for Pie Chart
app.COLORS = ["#1B9BDB", "#6CA63E", "#9E9E9E", "#C44F9A", "#7266B9", "#E7A635", "#159FA8", "#000"]

// Values for applicant type
app.Types = {
	Applicant: 0,
	Matriculant: 1
};

// Values for race type
app.Races = {
	Hispanic: 0,
	Asian: 1,
	NativeAmerican: 2,
	Black: 3,
	White: 4,
	NativeHawaiian: 5,
	Foreign: 6,
	All: 7
};

// Hold values for selected applicant type,
// selected race, and selected state
app.selectedType = app.Types.Applicant;
app.selectedRace = app.Races.All;
app.selectedState = null;

// Hold the centroid values for all of the
// states
app.stateCentroids = {};


// Set the size of the map
var width = app.width,
		height = app.height,
		centered;

var projection = d3.geo.albersUsa()
		.scale([width])
		.translate([width / 2, height / 2])

var path = d3.geo.path()
		.projection(projection);


var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", click);

var states = svg.append("g")
		.attr("id", "states");

// Circles
var circles = svg.append("g")
								 .attr("id", "circles");

// Pie Charts
var pies = svg.append("g")
							.attr("id", "pies");

// Text
var text = svg.append("g")
						 	.attr("id", "text");

states.append("rect")
			.attr("class", "background")
			.attr("width", width)
			.attr("height", height);

states.selectAll("path")
	.data(aamc_data.features)
	.enter()
	.append("path")
	.attr("d", path);

redraw(aamc_data);

/**
 * Returns the string for a race given an integer.
 */
function getRaceString(i) {
	switch(i) {
		case app.Races.Hispanic:
			return "Hispanic";

		case app.Races.Asian:
			return "Asian";

		case app.Races.NativeAmerican:
			return "NativeAmerican";

		case app.Races.Black:
			return "Black";

		case app.Races.White:
			return "White";

		case app.Races.NativeHawaiian:
			return "NativeHawaiian";

		case app.Races.Foreign:
			return "Foreign";

		case app.Races.All:
			return "All";

	}
	return;
}

/**
 * Clear the map
 * Stop highlighting the last child in circles
 * Remove the last child in text
 */
function clear() {
	$("#circles circle:last").remove();
	$("#text text:last").remove();
}

/**
 * Clear the pie charts and their text
 */
function clearPieCharts() {
	$("#pies").children().remove();
	$("#text text:last").remove();
}

/**
 * Determine the size of the circles
 */
function redraw(json) {
	json.features.forEach(function(d, i) {
		// Get the center coordinates for each state
		var centroid = path.centroid(d);
		centroid.x = centroid[0];
		centroid.y = centroid[1];
		centroid.feature = d;

		var type = (app.selectedType == app.Types.Applicant) ? "Applicants" : "Matriculants";

		var total = 0;
		var types = d["aamc_data"][type];
		var state = d["properties"]["name"];

		app.stateCentroids[state] = {};
		app.stateCentroids[state].x = centroid.x;
		app.stateCentroids[state].y = centroid.y;

		total = aamc_by_state[state][type]["Total"];

		var size = app.MAX_CIRCLE_SIZE * (total / app.MAX_APPLICANTS);
		size = size < app.MIN_CIRCLE_SIZE ? app.MIN_CIRCLE_SIZE : size;

		circles.append("circle")
					 .attr("cx", centroid.x)
					 .attr("cy", centroid.y)
					 .attr("r", size)
					 .attr("id", state)
					 .on("click", click)
					 .classed("neutral", true);

	});
}

/**
 * Highlight a state by enlarging its
 * circle and adding text to it
 */
function selectState(node) {
	var cx = node.attr("cx");
	var cy = node.attr("cy");
	var r = node.attr("r");
	var state = node.attr("id");
	var type = (app.selectedType == app.Types.Applicant) ? "Applicants" : "Matriculants";

	node.remove();

	// Render the backup circle
	circles.append("circle")
				 .attr("cx", cx)
				 .attr("cy", cy)
				 .attr("r", r)
				 .attr("id", state)
				 .on("click", click)
				 .classed("neutral", true);


	// Render the selected circle
	circles.append("circle")
				 .attr("cx", cx)
				 .attr("cy", cy)
				 .attr("r", r)
				 .attr("id", state)
				 .on("click", click)
				 .classed("neutral", true)
				 .transition()
				 .attr("class", "highlighted")
				 .duration(1000)
				 .attr("r", app.SELECTED_CIRCLE_SIZE);

	renderText(cx, parseInt(cy) + app.TEXT_Y_OFFSET, aamc_by_state[state][type]["Total"]);
}

/**
 * Renders SVG text
 */
function renderText(x, y, str) {
	text.append("text")
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle")
			.attr("class", "num")
			.transition()
			.duration(1000)
			.text(str);
}

/**
 * Executes when clicking on a state's circle
 */
function click(d) {
	var state = d3.select(this)
								.attr("id");
	var node = d3.select(this);

	// If user hasn't selected a state,
	// highlight the clicked state's bubble
	if (!app.selectedState) {
		app.selectedState = state;
		selectState(node);
	} else if (app.selectedState == state) {
		clear();
		app.selectedState = null;
		
	} else {
		clear();
		app.selectedState = state;
		selectState(node);
	}

}

/**
 * Remove the fill from all of the race circles.
 */
function unselectRaces() {
	$(".race-wrapper").find("circle").each(function() {
		d3.select(this)
			.attr("fill", "#fff");
	});
}

/**
 * Render a pie chart for the currently
 * selected state
 */
function renderPieChart() {
	console.log("Inside of renderPieChart()");
	var pieWidth = app.SELECTED_CIRCLE_SIZE;
	var pieHeight = app.SELECTED_CIRCLE_SIZE;
	var pieRadius = pieHeight;
	/*
	var color = d3.scale.ordinal()
    .range(app.COLORS);
   */
	var color = d3.scale.ordinal()
	.domain(d3.range(8))
	.range(["#C44F9A","#E7A635","#6CA63E","#9E9E9E","#7266B9","#159FA8","#1B9BDB","#000"]);

  var state = app.selectedState;
	var type = (app.selectedType == app.Types.Applicant) ? "Applicants" : "Matriculants";
	var race = app.selectedRace;
	var raceStr = getRaceString(race);
	var filename = "csv/" + state + type + ".csv"

  var centroids = app.stateCentroids[app.selectedState];

  var arc = d3.svg.arc()
    .outerRadius(pieRadius)
    .innerRadius(0);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return 1000; });

  //clear();


	d3.csv(filename, function(data) {

		var values = [];
		for (var i = 0; i < data.length - 1; i++) {
			values.push(parseInt(data[i]["Value"]));
		}
		console.log(data);
		console.log(values);
	  var g = pies.selectAll(".arc")
	      				.data(pie([1, 200]))
	    					.enter().append("g")
	      				.attr("class", "arc")
	      				.attr("transform", "translate(" + centroids.x + "," + centroids.y + ")");

	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d, i) { return color(i); });

	});


	var percentage = ( parseFloat(aamc_by_state[state][type][raceStr]) / parseFloat(aamc_by_state[state][type]["Total"])) * 100;
	console.log(percentage);
	renderText(centroids.x, centroids.y + app.TEXT_Y_OFFSET, Math.ceil(percentage) + "%");
}

/**
 * Click selectors on all of the races.
 * Not the best code, but this is a data
 * visualization class.
 */
$("#icon_hispanic").bind("click", function() {
	if (app.selectedState == null) return;

	unselectRaces();
	clearPieCharts();
	if (app.selectedRace == app.Races.Hispanic) {
		app.selectedRace = null;
		clear();
		var node = d3.select("#" + app.selectedState);
		selectState(node);
	} else {
		app.selectedRace = app.Races.Hispanic;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
		renderPieChart();
	}

});

$("#icon_asian").bind("click", function() {
	if (app.selectedState == null) return;

	unselectRaces();
	clearPieCharts();

	if (app.selectedRace == app.Races.Asian) {
		app.selectedRace = null;
		clear();
		var node = d3.select("#" + app.selectedState);
		selectState(node);
	} else {
		app.selectedRace = app.Races.Asian;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
		renderPieChart();
	}
});

$("#icon_native").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.NativeAmerican) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.NativeAmerican;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

$("#icon_black").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.Black) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.Black;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

$("#icon_white").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.White) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.White;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

$("#icon_pacific").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.NativeHawaiian) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.NativeHawaiian;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

$("#icon_foreign").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.Foreign) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.Foreign;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

$("#icon_all").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.All) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.All;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
	}
});

/**
 * Click selectors on the Applicants and
 * Matriculants.
 */
 /*
d3.select("#icon_applicants")
	.on("click", function() {
		console.log("Clicked on applicants");
	});

$("#icon_applicants").bind("click", function() {
	if (app.selectedType != app.Types.Applicants) {
		d3.select(this)
			.attr("data", "svg/icon_applicants_off.svg");
	}
});

$("#icon_matriculants").bind("click", function() {
	console.log("Clicked on Matriculants");
	if (app.selectedType != app.Types.Matriculants) {
		d3.select(this)
			.attr("data", "svg/icon_matriculants_on.svg");
	}
});
*/