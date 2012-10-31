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
				.on("zoom", zoom);

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
						.enter().append("path")
						.attr("d", path)
						.on("click", click);
		});

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