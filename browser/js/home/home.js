app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($window, $rootScope, $scope, SpotifyRetriever, AUTH_EVENTS, $log, d3Service, PlayerFactory){
	
	$scope.optionList = [{name: 'Danceability',value:'danceability'}, 
						{name: 'Tempo',value:'tempo'}, 
						{name: 'Energy',value:'energy'}, 
						{name: 'Duration', value:'duration_ms'}, 
						{name: 'Positivity',value:'valence'},
						{name: "Speechiness", value:'speechiness'},
						{name: "Acousticness", value:'acousticness'},
						{name: "Liveness", value: 'liveness'},
						{name: "Key", value: 'key'}]
						

	$scope.metadata = 'duration_ms';

	$scope.changeMeta = function(string){
		$scope.metadata = string;
		$scope.render($scope.tracks);
	}

	var getSongs = function(){
		SpotifyRetriever.getAudioFeaturesForMany()
		.then(function(tracks){
			tracks = tracks.map(function(e){
				return e.audio_features;
			})
			tracks = _.flatten(tracks);
			$scope.tracks = tracks;

			$scope.tracks.sort(function(a,b){return b[$scope.metadata] - a[$scope.metadata]});

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

  			var height = window.innerHeight-140;
  			var width = window.innerWidth;


  			//Make seconds instead of milliseconds
  			if ($scope.metadata==='duration_ms') {
  				data = data.map(function(d){
  					d[$scope.metadata] = d[$scope.metadata]/1000;
  					return d;
  				})
  			}
  				

  			var buckets = 40;
  			
  			var xScale = d3.scaleLinear()
  				.domain([d3.min(data, function(d){ return d[$scope.metadata]}), d3.max(data, function(d){ return d[$scope.metadata]})])
			    .range([0, width]);

			var histogram = d3.histogram()
								.domain(xScale.domain())
								.thresholds(xScale.ticks(buckets));

			// var histo = histogram(data.map(function(d){return d[$scope.metadata]));
			var histo = histogram.value(function(d){return d[$scope.metadata]})(data);

			barWidth = (width-margin*2)/histo.length-barPadding;


			console.log(histo);

		 
		//     // set the height based on the calculations above
		   	svg.attr('height', width);


			var yScale = d3.scaleLinear()
			    .domain([0, d3.max(histo, function(d) { return d.length; })])
			    .range([height, 20]);

			//var formatCount = d3.format(",.0f")

			var bar = svg.selectAll(".bar")
			    .data(histo)
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
		       	.attr('opacity', 1)
		       	.transition()
		         	.duration(800)
		         	.attr('y', function(d){return yScale(d.length)})
		        	.attr('height', function(d){return height - yScale(d.length)})

		      bar.append("text")
			    .attr("font-size", barWidth/1.7)
			    .attr('font-family', 'courier')
			    .attr('y', height)
			    .attr("x", function(d, i){ return (barWidth+barPadding)*i+margin+barWidth/2})
			    .attr("text-anchor", "middle")
			    .style('fill', 'white')
			    .text(function(d) { if (d.length) return d.length })
		      	.transition()
		        .duration(800)
			    .attr("y", function(d){return yScale(d.length)-barWidth/5})	

		    svg.selectAll('rect')
		    .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);

 
		};

	function handleMouseOver(d, i) {  // Add interactivity

            // Use D3 to select element, change color and size
            d3.select(this).attr('opacity', .5)




            // Specify where to put label of text

            svg.append("text")
               .attr('id', "t" + i)
               .attr('x', 100).attr('y', 100)
               .attr('font-family', '"Arial Black", Gadget, sans-serif')
               .attr('fill', "white").text("BPM: " + d.x0 + ' to '+d.x1);
     
          }

	function handleMouseOut(d, i) {
	    // Use D3 to select element, change color back to normal
	    d3.select(this).attr('opacity', 1)

	    // // Select text by id and then remove
	    d3.select("#t" + i).remove();  // Remove text location
	  }

	  function handleClick(d, i) {

			//Get track name and preview URL etc for selection.
            var trackIds = d.map(function(t){return t.id});
	    
		    SpotifyRetriever.getTracksById(trackIds)
		    .then(function(tracks){
		    	tracks = tracks[0].tracks
		    	PlayerFactory.start(_.sample(tracks), tracks);
		    	$scope.currentSong = PlayerFactory.getCurrentSong();
		    })

	  }

	});

	$rootScope.$on('songChange', function(){
		$scope.currentSong = PlayerFactory.getCurrentSong();
	});

	$scope.stopSong = function(){
		PlayerFactory.pause();
		$scope.currentSong = null;
	}






	// svg.append('g')            // create a <g> element
	//   .attr('class', 'x axis') // specify classes
	//   .call(xAxis);            // let the axis do its thing



	$rootScope.$on(AUTH_EVENTS.loginSuccess, getSongs);

});