var ms5803 = require('.');

var sensor = new ms5803();
/*
sensor.reset(()=>{
	sensor.begin(()=>{
		sensor.measure();
	});	
});
*/

sensor.reset()
	.then(()=>{
		console.log('reset');
	});
