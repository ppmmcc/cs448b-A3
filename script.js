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
			All: 6
		};


		// Hold values for selected applicant type,
		// selected race, and selected state
		app.selectedType = app.Types.Applicant;
		app.selectedRace = app.Races.All;
		app.selectedState = null;


		// Size of the map
		var width = app.width,
				height = app.height,
				centered;

		var projection = d3.geo.albersUsa()
				.scale([width])
				//.transform.scale()
				.translate([width / 2, height / 2])

		var path = d3.geo.path()
				.projection(projection);

		/*
		var zoom = d3.behavior.zoom()
				.translate(projection.translate())
				.scale(projection.scale())
				.scaleExtent([height, 8 * height])
				//.on("zoom", zoom);
		*/

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
				//.call(zoom);

		// Circles
		var circles = svg.append("g")
										 .attr("id", "circles");

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

		clear();

		/**
		 * Clear the map
		 * Stop highlighting the last child in circles
		 * Remove the last child in text
		 */
		function clear() {
			var lastCircle = $("#circles circle:last");
			lastCircle.transition()
								.duration(1000)
								.attr("class", "neutral");

			$("#text text:last").remove();
		}


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

			node.remove();
			circles.append("circle")
						 .attr("cx", cx)
						 .attr("cy", cy)
						 .attr("r", node.attr("r"))
						 .attr("id", node.attr("id"))
						 .on("click", click)
						 .classed("neutral", true)
						 .transition()
						 .attr("class", "highlighted")
						 .duration(1000)
						 .attr("r", app.SELECTED_CIRCLE_SIZE);

			// Render the text
			text.append("text")
					.attr("x", cx)
					.attr("y", parseInt(cy) + 5)
					.attr("text-anchor", "middle")
					.attr("class", "num")
					.transition()
					.duration(1000)
					.text(1000);
		}

		function click(d) {
			var state = d3.select(this)
										.attr("id");
			var node = d3.select(this);

			// If user hasn't selected a state,
			// highlight the clicked state's bubble
			if (app.selectedState != state) {
				// Clear text and clear circles
				app.selectedState = state;
				selectState(node);
			} else {
				clear();
			}




				



			/*
			var x = 0,
					y = 0,
					k = 1;


			if (d && centered !== d) {
				var centroid = path.centroid(d);
				k = 2;
				x = -centroid[0] / k;
				y = -centroid[1] / k;

				centered = d;
			} else {
				centered = null;
			}

			states.selectAll("path").classed("active", centered && function(d) {return d === centered; });

			states.transition()
	      .duration(1000)
	      .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
	      .style("stroke-width", 1.5 / k + "px");
	      */
			}

		/*
		function zoom() {
			projection.translate(d3.event.translate).scale(d3.event.scale);
			states.selectAll("path").attr("d", path);
		}
		*/