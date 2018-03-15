
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

const MEASUREMENT = {
	PRESSURE: 0x40,
	TEMPERATURE: 0x50
}

var i2c = require('i2c');
var Long = require('long');
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

sensor.reset = function(){	
	return writeBytes(CMD_RESET, []);
};

sensor.begin = async function(){	
	return new Promise(async (resolve, reject)=>{
		sensor.coefficient = [0,0,0,0,0,0,0,0];
		try{
			for(var i=0; i<8; i++){
				var result = await readBytes(CMD_PROM+(i*2), 2);
				sensor.coefficient[i] = (result[0] <<8 )|result[1];
			}
			return resolve(sensor.coefficient);
		}catch(exception){
			console.error(exception);
			return reject();
		}
	});
}

getADCConversion = async function (measurement, precision){
	return new Promise(async (resolve, reject)=>{
		try{
			writeBytes(measurement+precision); //+ measurement, + precision);
			await delay(10);
			var r = await readBytes(CMD_ADC_READ, 3);
			result = (r[0] << 16) + (r[1]<<8) + r[2];
			resolve(result);
		}catch(exception){
			return reject();
		}
	});
}

sensor.measure = async function(precision = PRECISION.ADC_2048){
	return new Promise(async (resolve, reject)=>{
		try{
			var temp_raw = await getADCConversion(MEASUREMENT.TEMPERATURE, precision);
			var pres_raw = await getADCConversion(MEASUREMENT.PRESSURE, precision);
			var c = sensor.coefficient;
			var dT = temp_raw - (c[5]<<8);
			var temp_calc = (new Long(dT).mul(c[6]).shr(23).add(2000)).toNumber();
			var t2 = new Long(0,0);
			var off2, sens2;
			if(temp_calc<2000){
				//console.log(t2.add(3).mul(dT).mul(dT).shr(33));
				t2 = new Long(3).mul(dT).mul(dT).shr(33);
				//console.log(t2);
				off2 = 3*(temp_calc-2000)*(temp_calc-2000)/2;
				sens2 = 5*(temp_calc-2000)*(temp_calc-2000)/8;
				if(temp_calc<-1500){
					off2 = off2+(7*(temp_calc+1500)*(temp_calc+1500));
					sens2 = sens2 + (4*(temp_calc+1500)*(temp_calc+1500));
				}
			}else{
				t2 = new Long(0,0).add(7).mul(dT).mul(dT).shr(37);
				off2=(temp_calc-2000)*(temp_calc-2000)/16;
				sens2 = 0;
			}
			var off = new Long(c[2]).shl(16).add(
				(c[4]*dT)>>7
			);
			var sens = new Long(c[1]).shl(15).add((c[3]*dT)>>8);
			
			temp_calc = temp_calc - t2.toNumber();
			off = off.sub(off2);
			sens = sens.sub(sens2);
			var pressure_calc = 
				sens.mul(pres_raw).div(2097152).sub(off).div(32768).toNumber();
			resolve({
				pressure: pressure_calc/10,
				temperature: temp_calc/100,
				temperature_f: temp_calc/100*9/5 + 32
			})
		}catch(exception){
			return reject(exception);
		}
	});
}

return sensor;
}
