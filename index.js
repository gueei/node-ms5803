
module.exports = function  ms5803(addr=0x76){

const	CMD_RESET = 0x1E,
	CMD_ADC_READ = 0x00,
	CMD_ADC_CONV = 0x40,
	CMD_PROM = 0xA0;
	
const PRECISION = {
	ADC_256: 0x00,
	ADC_512: 0x02,
	ADC_1024: 0x04,
	ADC_2048: 0x06,
	ADC_4096: 0x08
}

var i2c = require('i2c');
var sensor = function(){};
var wire = new i2c(addr);

sensor.coefficient = [];

var writeBytes = function(command, bytes=[]){
	return new Promise( (resolve, reject) => {
		wire.writeBytes(command, bytes, (err) =>{
			if (err!=null) return reject(err);
			resolve();
		});
	});
};

var readBytes = function(command, count=2){
	return new Promise( (resolve, reject)=>{
		wire.readBytes(command, count, (err, res)=> {
			if (err!=null) return reject(err);
			resolve(res);
		});
	});
}

var delay = function(ms){
	return new Promise( (resolve, reject)=>{
		setTimeout(()=>{
			return resolve();
		}, ms);
	});
}

sensor.reset = function(cb){
	if (typeof(cb)!='function')
		return writeBytes(CMD_RESET, []);
	
	writeBytes(CMD_RESET, [])
		.then( () => {
			return new Promise((resolve)=>{
				resolve();
			});
		}).catch((error)=>{
			console.log(error);
		});
};

sensor.begin = async function(cb){
	sensor.coefficient = [0,0,0,0,0,0,0,0];
	try{
		for(var i=0; i<8; i++){
			var result = await readBytes(CMD_PROM+(i*2), 2);
			sensor.coefficient[i] = (result[0] <<8 )|result[1];
		}
		cb();
	}catch(exception){
		console.error(exception);
	}
}

getADCConversion = async function (precision){
	var result;
	try{
		await writeBytes(CMD_ADC_CONV);
		await delay(10);
		var result = await readBytes(CMD_ADC_READ, 3);
		console.log(result);
	}catch(err){
		
	}
}

sensor.measure = function(){
		getADCConversion();
}

return sensor;
}
