app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($window, $rootScope, $scope, SpotifyRetriever, AUTH_EVENTS, $log, d3Service){
	
	
	var getSongs = function(){
		SpotifyRetriever.getAudioFeaturesForMany()
		.then(function(tracks){
			tracks = tracks.map(function(e){
				return e.audio_features;
			})
			tracks = _.flatten(tracks);
			$scope.tracks = tracks;

			console.log(tracks);

			$scope.tracks.sort(function(a,b){return b.danceability - a.danceability});

			$scope.render($scope.tracks);
		})
		.catch($log);
	}

	d3Service.d3().then(function(d3) {
		var svg = d3.select('#chart').attr('align', 'center')
		.append('svg')        // create an <svg> element
		.style('height', '100%')
		.style('width', '100%'); // set its dimentions


		// Browser onresize event
		window.onresize = function() {
			$scope.$apply();
		};

		// Watch for resize event
		$scope.$watch(function() {
			return angular.element($window)[0].innerWidth;
		}, function() {
			$scope.render($scope.tracks);
		});

    	var margin = 30;
		var barWidth = 20;
		var barPadding = 2;

		// Use the category20() scale function for multicolor support
       	var color = d3.scaleOrdinal(d3.schemeCategory20);

		$scope.render = function(data) {

			svg.selectAll('*').remove();
	 
		    // If we don't pass any data, return out of the element
		   	if (!data) return;
		 
		    // setup variables
		 //var height = d3.select('#chart').node().offsetHeight - margin;
		//         // calculate the height
  //      	var width = $scope.tracks.length * (barWidth + barPadding);
        
  //       

  			var height = window.innerHeight-100;
  			var width = window.innerWidth;

  			barWidth = width/60;

  			var xScale = d3.scaleLinear()
  				.domain([0,1])
			    .range([0, width]);

			var histogram = d3.histogram()
								.domain(xScale.domain())
								.thresholds(xScale.ticks(40));

			var data = histogram(data.map(function(d){return d.danceability}));

			console.log(data);
		 
		//     // set the height based on the calculations above
		   	svg.attr('height', width);


			var yScale = d3.scaleLinear()
			    .domain([0, d3.max(data, function(d) { return d.length; })])
			    .range([height, 10]);

			//var formatCount = d3.format(",.0f")

			var bar = svg.selectAll(".bar")
			    .data(data)
			 	.enter().append("g")
			    .attr("class", "bar")
			    //.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
		 
		//     //create the rectangles for the bar chart
		   	// svg.selectAll('rect')
		    //  	.data(data).enter()

		      bar.append('rect')
		       	.attr('width', barWidth)
		       	.attr('height', 0)
		       	.attr('x', function(d, i){ return (barWidth+barPadding)*i+margin})
		       	.attr('y', height)
		       	.attr('fill', function(d) { return color(d); })
		       	.transition()
		         	.duration(800)
		         	.attr('y', function(d){return yScale(d.length)})
		        	.attr('height', function(d){return height - yScale(d.length)})

		      bar.append("text")
			    .attr("font-size", barWidth/1.5)
			    .attr("y", height+50)
			    .attr("x", function(d, i){ return (barWidth+barPadding)*i+margin+barWidth/2})
			    .attr("text-anchor", "middle")
			    .text(function(d) { if (d.length) return d.length })
		      	.transition()
		        .duration(800)
			    .attr("y", function(d){return yScale(d.length)+barWidth/1.5})	

		    // svg.selectAll('rect')
		    // .on("mouseover", handleMouseOver)
      //       .on("mouseout", handleMouseOut);

  







		};

	function handleMouseOver(d, i) {  // Add interactivity

			console.log(this);

            // Use D3 to select element, change color and size
            d3.select(this).attr('fill', "black").attr('width', 20);

            // Specify where to put label of text
            // var thisOne = svg.append("text").attr({
            //    id: "t" + d.id,  // Create an id for text so we can select it later for removing on mouseout
            //     x: 100,
            //     y: 100,
            //     fill: "white"
            // })
            //thisOne.text("FUCK");
          }

	function handleMouseOut(d, i) {
	    // Use D3 to select element, change color back to normal
	    d3.select(this).attr('fill', color(d.danceability));

	    // // Select text by id and then remove
	  //   // d3.select("#t" + d.id).remove();  // Remove text location
	  }






	});





	// svg.append('g')            // create a <g> element
	//   .attr('class', 'x axis') // specify classes
	//   .call(xAxis);            // let the axis do its thing



	$rootScope.$on(AUTH_EVENTS.loginSuccess, getSongs);

});