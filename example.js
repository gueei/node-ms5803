var ms5803 = require('.');

var sensor = new ms5803();

sensor.reset()
	.then(sensor.begin)
	.then((c)=>{
		console.log(c);
	})
	.then(()=>{
		setInterval(()=>{
				sensor.measure(0x08)
				.then((r)=>{
					console.log(r);
				})
		}, 1000);
	})
	.catch((error)=>{
		console.error(error);
	});
