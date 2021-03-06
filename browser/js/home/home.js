app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeCtrl'
    });
});

app.controller('HomeCtrl', function($window, $rootScope, $scope, SpotifyRetriever, AUTH_EVENTS, $log, d3Service, PlayerFactory, usSpinnerService){
	
	$scope.optionList = [{name: 'Danceability',value:'danceability'},
						{name: "Key", value: 'key'}, 
						{name: 'Tempo',value:'tempo'}, 
						{name: 'Energy',value:'energy'}, 
						{name: 'Positivity',value:'valence'},
						{name: "Acousticness", value:'acousticness'},
						{name: "Liveness", value: 'liveness'}]
						

	$scope.metadata = 'danceability';

	$scope.changeMeta = function(string){
		$scope.metadata = string;
		$scope.render($scope.tracks);
	}

	var keyNames = ['C','C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	var getSongs = function(){

		$scope.showSpinner = true;

		SpotifyRetriever.getAllPlaylistSongs($rootScope.user.id)
		.then(function(tracks){

			$scope.showSpinner = false;

			//make duration in seconds milliseconds instead
			tracks = tracks.map(function(d){
  					d['duration_ms'] = d['duration_ms']/1000;
  					return d;
  				})

			$scope.tracks = tracks;

			$scope.tracks.sort(function(a,b){return b[$scope.metadata] - a[$scope.metadata]});

			$scope.render($scope.tracks);
		})
		
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
        var piecolor = d3.scaleOrdinal(d3.schemeCategory20);

		$scope.render = function(data) {

			svg.selectAll('*').remove();
			d3.select("#pieChart").selectAll('*').remove();
	 
		    // If we don't pass any data, return out of the element
		   	if (!data) return;
		 
		    // setup variables
		 //var height = d3.select('#chart').node().offsetHeight - margin;
		//         // calculate the height
  //      	var width = $scope.tracks.length * (barWidth + barPadding);
        
  //       


  			var height = window.innerHeight-90;
  			var width = window.innerWidth;


  			var buckets = 40;
  			
  			var xScale = d3.scaleLinear()
  				.domain([d3.min(data, function(d){ return d[$scope.metadata]}), d3.max(data, function(d){ return d[$scope.metadata]})])
			    .range([0, width]);

			var histogram = d3.histogram()
								.domain(xScale.domain())
								.thresholds(xScale.ticks(buckets));

			// var histo = histogram(data.map(function(d){return d[$scope.metadata]));
			var histo = histogram.value(function(d){return d[$scope.metadata]})(data);

  			//Check if for "Key"
  			if ($scope.metadata==='key') {

  				var keyArrays = histo.filter(function(e){return e.length});

  				var totalDatapoints = 0;

				keyArrays.forEach(function(d){
					totalDatapoints += d.length;
				})

  				keyArrays = keyArrays.map(function(d, i){
					d.percent = (d.length/totalDatapoints*100).toFixed(1);
					d.keyName = (keyNames[i]);
					return d;
				})


  				var j = (width-2*margin)/(300);


  				var keyMargin;
  				if (width > 800) keyMargin = (width - (j*161))/2+ 100;
  				else keyMargin = 30;

  				var keyOrder = [0,2,4,5,7,9,11,1,3,6,8,10] //white then black keys

  				var mappedData = Array(9);
  				
  				for (var m = 0; m< 12; m++) {
  					var idx = keyOrder.indexOf(m);
  					mappedData[idx] = keyArrays[m];
  				}

	  			for (var i = 0; i < 7; i++) {
	  			svg.append('rect')
	  				.attr('id', 'key'+ keyOrder[i])
	  				.style('fill', 'white')
	  				.style('stroke', 'black')
	  				.attr('x', j*23*i + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*23)
	  				.attr('height', j*120)
	  			}

	  			svg.append('rect')
	  				.attr('id', 'key2')
	  				.style('fill', 'black')
	  				.style('stroke', 'black')
	  				.attr('x', j*14.33333 + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*13)
	  				.attr('height', j*80);
	  			svg.append('rect')
	  				.attr('id', 'key4')
	  				.style('fill', 'black')
	  				.style('stroke', 'black')
	  				.attr('x', j*41.66666 + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*13)
	  				.attr('height', j*80);
	  			svg.append('rect')
	  				.attr('id', 'key7')
	  				.style('fill', 'black')
	  				.style('stroke', 'black')
	  				.attr('x', j*82.25 + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*13)
	  				.attr('height', j*80);
	  			svg.append('rect')
	  				.attr('id', 'key9')
	  				.style('fill', 'black')
	  				.style('stroke', 'black')
	  				.attr('x', j*108.25 + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*13)
	  				.attr('height', j*80);
	  			svg.append('rect')
	  				.attr('id', 'key11')
	  				.style('fill', 'black')
	  				.style('stroke', 'black')
	  				.attr('x', j*134.75 + keyMargin)
	  				.attr('y', 45)
	  				.attr('width', j*13)
	  				.attr('height', j*80);

	  			var keyVals = d3.select('svg').selectAll('rect')
	  						.data(mappedData)
	  						.on("mouseover", handleMouseOver)
				            .on("mouseout", handleMouseOut)
				            .on("click", handleClick);



				 
				var pie=d3.pie()
				  .value(function(d){return d.percent})
				  .sort(null)
				  .padAngle(.03);
				 
				var w=300,h=300;
				 
				var outerRadius=w/2;
				var innerRadius=100;
				
				 
				var arc=d3.arc()
				  .outerRadius(outerRadius)
				  .innerRadius(innerRadius);
				 
				

				var group = svg.append('g')
							.attr('x', 200)
							.attr('y', 200)

				if (width < 800) group.attr('transform', 'translate(200, 400)');
				else group.attr('transform', 'translate(200, 250)');

				var path = group.selectAll('path')
				  .data(pie(keyArrays))
				  .enter()
				  .append('path')
				  .attr('d', arc)
				  .attr('fill', function(d,i){return piecolor(d.data.keyName)});

				 				 
				path.transition()
				  .duration(1000)
				  .attrTween('d', function(d) {
				      var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
				      return function(t) {
				          return arc(interpolate(t));
				      };
				  });
				 
				 
				var restOfTheData=function(){
				    var text = group.selectAll('text')
				        .data(pie(keyArrays))
				        .enter()
				        .append("text")
				        .transition()
				        .duration(200)
				        .attr("transform", function (d) {
				            return "translate(" + arc.centroid(d) + ")";
				        })
				        .attr("dy", ".4em")
				        .attr("text-anchor", "middle")
				        .text(function(d){
				            return d.data.keyName + ": " + d.data.percent+"%";
				        })
				        .style('fill', '#fff')
				        .style('font-size', '10px');
				        
				 
				    var legendRectSize=20;
				    var legendSpacing=7;
				    var legendHeight=legendRectSize+legendSpacing;
				 
				 
				};
				 
				setTimeout(restOfTheData,1000);


  			} else {

			barWidth = (width-margin*2)/histo.length-barPadding;
		 
		    // set the height based on the calculations above
		   	svg.attr('height', width);


			var yScale = d3.scaleLinear()
			    .domain([0, d3.max(histo, function(d) { return d.length; })])
			    .range([height, 65]);


			var bar = svg.selectAll(".bar")
			    .data(histo)
			 	.enter().append("g")
			    .attr("class", "bar")
	
		      bar.append('rect')
		       	.attr('width', barWidth)
		       	.attr('height', 0)
		       	.attr('x', function(d, i){ return (barWidth+barPadding)*i+margin})
		       	.attr('y', height)
		       	.attr('fill', function(d) { return color(d); })
		       	.attr('opacity', 1)
		       	.transition()
		         	.duration(700)
		         	.attr('y', function(d){return yScale(d.length)})
		        	.attr('height', function(d){return height - yScale(d.length)})

		      bar.append("text")
			    .attr("font-size", barWidth/1.7)
			    .attr('font-family', 'courier')
			    .attr('y', height)
			    .attr("x", function(d, i){ return (barWidth+barPadding)*i+margin+barWidth/2})
			    .attr("text-anchor", "middle")
			    .style('fill', '#222222')
			    .text(function(d) { if (d.length) return d.length })
		      	.transition()
		        .duration(700)
		        .style('fill', 'white')
			    .attr("y", function(d){return yScale(d.length)-barWidth/5})	

		    svg.selectAll('rect')
		    .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);

 
 		}
		};

	function handleMouseOver(d, i) {  // Add interactivity

			if ($scope.metadata!='key') {
	            // Use D3 to select element, change color and size
	            d3.select(this).attr('opacity', .5)
        	} else {
        		this.color = d3.select(this).style('fill');
        		d3.select(this).style('fill', piecolor(d.keyName))
        	}

            // Specify where to put label of text

            var textInsert = "";

            var toSecs = function(num) {
            	if ((Math.round(num%60)).toString().length<2) return "0"+Math.round(num%60)
            	return Math.round(num%60);
            }

            if ($scope.metadata === 'tempo') {
            	textInsert = "BPM: " + d.x0 + ' to '+d.x1
            } else if ($scope.metadata === 'duration_ms') {
            	textInsert += Math.floor(d.x0/60) + ":" + toSecs(d.x0) + ' to ' + Math.floor(d.x1/60) + ":" + toSecs(d.x1)
            } else if ($scope.metadata === 'key') {
            	textInsert = keyNames[Math.round(d.x0)] +': '+d.length
            } else {
            	textInsert = "Percentile: " + Math.round((d.x0 + d.x1)/2*100) + "%";
            }


            d3.select('footer').append("text")
               .attr('id', "t" + i)
               .attr('font-family', '"Arial Black", Gadget, sans-serif')
               .style('color', "white").text(textInsert);
     
          }

	function handleMouseOut(d, i) {
	   
		if ($scope.metadata!='key') {
	   		// Use D3 to select element, change color back to normal
	    	d3.select(this).attr('opacity', 1)
		} else {
			d3.select(this).style('fill', this.color);
		}

	    // // Select text by id and then remove
	    d3.select("#t" + i).remove();  // Remove text location
	  }

	  function handleClick(d, i) {

	  		if ($scope.metadata==='key') {

	  			d3.select(this)
	  				.style('fill', d3.color(piecolor(d.keyName)).darker(2))
	  				.transition()
	  				.duration(400)
	  				.transition()
	  				.duration(600)
	  				.style('fill', this.color);

	  		}

			//Get track name and preview URL etc for selection.
            var trackIds = d.map(function(t){return t.id});
	    
		    SpotifyRetriever.getTracksById(trackIds)
		    .then(function(tracks){
		    	tracks = _.flatten(tracks);
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



	$rootScope.$on(AUTH_EVENTS.loginSuccess, getSongs);

});