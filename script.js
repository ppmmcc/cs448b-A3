		// Set namespace
		var app = {};

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


		// Hold values for applicant type and
		// selected race
		app.selectedType = app.Types.Applicant;
		app.selectedRace = app.Races.All;


		// Size of the map
		var width = 960,
				height = 500,
				centered;

		var projection = d3.geo.albersUsa()
				.scale(width)
				.translate([width / 2, height / 2]);

		var path = d3.geo.path()
				.projection(projection);

		var zoom = d3.behavior.zoom()
				.translate(projection.translate())
				.scale(projection.scale())
				.scaleExtent([height, 8 * height])
				//.on("zoom", zoom);

		var svg = d3.select("#map").append("svg")
				.attr("width", width)
				.attr("height", height);

		svg.append("rect")
		    .attr("class", "background")
		    .attr("width", width)
		    .attr("height", height)
		    .on("click", click);

		var states = svg.append("g")
				.attr("id", "states")
				.call(zoom);

		states.append("rect")
					.attr("class", "background")
					.attr("width", width)
					.attr("height", height);

		d3.json("us-aamc-states.json", function(json) {
			states.selectAll("path")
						.data(json.features)
						.enter()
						.append("path")
						.attr("d", path)
						//.call(collectStateData)
						.on("click", click);

			json.features.forEach(function(d, i) {
				var centroid = path.centroid(d);
				console.log(centroid);
				centroid.x = centroid[0];
				centroid.y = centroid[1];
				centroid.feature = d;

				var circles = svg.append("g"
				.attr("id", "circles"));



			});

			// Draw a circle that represents the number
			// of applicants/matriculants
			/*
	    states.append('svg:circle')
	        .attr('cx', 100)
	        .attr('cy', 100)
	        .attr('r', 25)
	        .classed("neutral", true)
	        .on("mouseover", function() {
	        	console.log("test");
	        });
				*/
		});


/*
		var stateData;

		function collectStateData(selection) {
			stateData = selection;
			//console.log(selection.attr("d"));
			selection.each(function(d, i) {
				console.log(d.attr("d"));
			});
			//var centroid = path.centroid();
			//console.log(centroid);
			//console.log(stateData);
			//console.log(selection);
		}
		*/


		function click(d) {
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
			}

		function zoom() {
			projection.translate(d3.event.translate).scale(d3.event.scale);
			states.selectAll("path").attr("d", path);
		}