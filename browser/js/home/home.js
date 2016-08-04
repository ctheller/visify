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

    	var margin = 20;
		var barWidth = 10;
		var barPadding = 5;

		$scope.render = function(data) {

			svg.selectAll('*').remove();
	 
		    // If we don't pass any data, return out of the element
		   	if (!data) return;
		 
		    // setup variables
		var height = d3.select('#chart').node().offsetHeight - margin;
		        // calculate the height
       	var width = $scope.tracks.length * (barWidth + barPadding);
        // Use the category20() scale function for multicolor support
       	var color = d3.scale.category20();
        // our xScale
       	var yScale = d3.scale.linear()
         	.range([600, 0]);
		 
		    // set the height based on the calculations above
		   	svg.attr('height', width);
		 
		    //create the rectangles for the bar chart
		   	svg.selectAll('rect')
		     	.data(data).enter()
		       	.append('rect')
		       	.attr('width', barWidth)
		       	.attr('height', 0)
		       	.attr('y', 600)
		       	.attr('x', function(d,i) {
		         	return i * (barWidth + barPadding);
		       	})
		       	.attr('fill', function(d) { return color(d.danceability); })
		       	.transition()
		         	.duration(1000)
		         	.attr('y', function(d) {
		           	return 600 - yScale(d.danceability);
		        	})
		        	.attr('height', function(d) {
		           	return yScale(d.danceability);
		        	});
		};
	});





	// svg.append('g')            // create a <g> element
	//   .attr('class', 'x axis') // specify classes
	//   .call(xAxis);            // let the axis do its thing



	$rootScope.$on(AUTH_EVENTS.loginSuccess, getSongs);

});