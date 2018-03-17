# ms5803
Use MS5803-14BA on nodejs, e.g. RPi or similar SBC
Tested to run on Raspberry PI 3

## Installation

```bash
npm install ms5803
```

```javascript
var ms5803 = require('ms5803')

var sensor = new ms5803();
```

## Usage
This module supports both Promise style and node callback style of usage. 
Check the example.js for the basic usage. 

```javascript

var ms5803 = require('ms5803');
var sensor = new ms5803();

sensor.reset()
	.then(sensor.begin)
	.then((c)=>{
		console.log("calibration array: " + c);
	})
	.then(()=>{
		setInterval(()=>{
			sensor.measure()
			.then((r)=>{
				console.log("sensor readings:" + r);
			})
		}, 1000);
	})
	.catch((error)=>{
		console.error(error);
	});
```

## Acknowledgements
- This implementations is basically a javascript port from [SparkFun Pressure Sensor Breakout](https://github.com/sparkfun/MS5803-14BA_Breakout)
- Since javascript does not support 64-bit integer, [Long](https://www.npmjs.com/package/long) is used to do 64-bit calculations. 
