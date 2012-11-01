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

// Text
var text = svg.append("g")
						 	.attr("id", "text");

// Pie Charts
var pies = svg.append("g")
							.attr("id", "pies");

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
 * Clear the map
 * Stop highlighting the last child in circles
 * Remove the last child in text
 */
function clear() {
	$("#circles circle:last").remove();
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

		for (var race in types) {
			total += parseInt(types[race]);
		}

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

	// Render the text
	text.append("text")
			.attr("x", cx)
			.attr("y", parseInt(cy) + app.TEXT_Y_OFFSET)
			.attr("text-anchor", "middle")
			.attr("class", "num")
			.transition()
			.duration(1000)
			.text(1000);
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
	var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]); // Consider moving this to the top as a var inside the namespace

  var state = app.selectedState;
  var centroids = app.stateCentroids[app.selectedState];
  console.log(centroids);

  var arc = d3.svg.arc()
    .outerRadius(pieRadius - 10)
    .innerRadius(0);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return 1000; });

  clear();

	d3.csv("testData.csv", function(data) {

	  data.forEach(function(d) {
	    d.population = +d.population;
	  });

	  var g = pies.selectAll(".arc")
	      				.data(pie(data))
	    					.enter().append("g")
	      				.attr("class", "arc")
	      				.attr("transform", "translate(" + centroids.x + "," + centroids.y + ")");

	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d) { return color(d.data.age); });

	  /*
	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .style("text-anchor", "middle")
	      .text(function(d) { return d.data.age; });
	  */

	});

}

/**
 * Click selectors on all of the races.
 * Not the best code, but this is a data
 * visualization class.
 */
$("#icon_hispanic").bind("click", function() {
	if (app.selectedState == null) return;
	unselectRaces();
	if (app.selectedRace == app.Races.Hispanic) {
		app.selectedRace = null;
		// unrenderPieChart
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
	if (app.selectedRace == app.Races.Asian) {
		app.selectedRace = null;
	} else {
		app.selectedRace = app.Races.Asian;
		var elem = d3.select(this);
		var stroke = elem.attr("stroke");
		elem.attr("fill", stroke);
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