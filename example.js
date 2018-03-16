var ms5803 = require('.');

var sensor = new ms5803();

/*
sensor.reset()
	.then(sensor.begin)
	.then((c)=>{
		console.log(c);
	})
	.then(()=>{
		setInterval(()=>{
				sensor.measure()
				.then((r)=>{
					console.log(r);
				})
		}, 1000);
	})
	.catch((error)=>{
		console.error(error);
	});
*/

sensor.reset(function(){
	sensor.begin(function(err, coefficient){
		console.log(coefficient);

		setInterval( function(){
			sensor.measure(function(err, result){
				console.log(result);
			});
		}, 1000);
	});
});
