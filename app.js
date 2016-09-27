var SensorTag = require('sensortag');
var async = require('async');
var util = require('util');
var Client = require('node-rest-client').Client;
var c = new Client();



//ARTIK cloud stuff
var bearer = "Bearer INSERT_DEVICE_TOKEN_HERE";
var sdid = "INSERT_DEVICE_ID_HERE";
var artikCloud = "https://api.artik.cloud/v1.1/messages";

//sensorTagPost
var sensorTagPost = {
  headers: {
    "Content-Type" : "application/json",
    "Authorization": bearer
  },
  data: {
    "sdid" : sdid,
    "ts": new Date().valueOf(),
    "type": "message",
    "data": {
      "Orientation_Data": {

      }
    }
  }
}



SensorTag.discoverAll(function(sensorTag){
  console.log("SensorTag discovered: " + sensorTag.id);
  console.log("SensorTag type: " +sensorTag.type);

  sensorTag.on('disconnect', function(){
    console.log(sensorTag.id + ' disconnected!');
    postData();
  });

  async.series([
    function(callback) {
      sensorTag.connectAndSetUp(callback);
    },
    function(callback){
      setTimeout(callback, 2000);
    },
    function (callback) {
      console.log('Register notification handlers...');
      console.log('Set IR/Temperature notification handler...');
      sensorTag.on('irTemperatureChange', function(objTemperature, ambTemperature){
        //Uncomment below to see temperature readout
        console.log('\tobject temperature = %d °C', objTemperature.toFixed(1));
        console.log('\tambient temperature = %d °C', ambTemperature.toFixed(1));
        sensorTagPost.data.data.IR_Temperature = objTemperature.toFixed(1);
        sensorTagPost.data.data.Ambient_Temperature = ambTemperature.toFixed(1);
      });
      console.log('Set Accelerometer notification handler...');
      sensorTag.on('accelerometerChange', function(x, y, z){
        console.log('\tx = %d G', x.toFixed(1));
        console.log('\ty = %d G', y.toFixed(1));
        console.log('\tz = %d G', z.toFixed(1));
        sensorTagPost.data.data.Orientation_Data.X_accel = x.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Y_accel = y.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Z_accel = z.toFixed(1);
      });
      console.log('Set Humidity notification handler...');
      sensorTag.on('humidityChange', function(temperature, rh){
        console.log('\ttemperature = %d °C', temperature.toFixed(1));
        console.log('\thumidity = %d %', rh.toFixed(1));
        sensorTagPost.data.data.Humidity = rh.toFixed(1);
        sensorTagPost.data.data.Humidity_Temp = temperature.toFixed(1);
      });
      console.log('Set Magnometer notification handler...');
      sensorTag.on('magnetometerChange', function(x, y, z){
        console.log('\tx = %d μT', x.toFixed(1));
        console.log('\ty = %d μT', y.toFixed(1));
        console.log('\tz = %d μT', z.toFixed(1));
        sensorTagPost.data.data.Orientation_Data.X_mag = x.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Y_mag = y.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Z_mag = z.toFixed(1);
      });
      console.log('Set Barometric Pressure notification handler...');
      sensorTag.on('barometricPressureChange', function(pressure){
        console.log('\tpressure = %d mBar', pressure.toFixed(1));
        sensorTagPost.data.data.Barometric_Pressure = pressure.toFixed(1);
      });
      console.log('Set Gyroscope notification handler...');
      sensorTag.on('gyroscopeChange', function(x, y, z){
        console.log('\tx = %d °/s', x.toFixed(1));
        console.log('\ty = %d °/s', y.toFixed(1));
        console.log('\tz = %d °/s', z.toFixed(1));
        sensorTagPost.data.data.Orientation_Data.X_gyro = x.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Y_gyro = y.toFixed(1);
        sensorTagPost.data.data.Orientation_Data.Z_gyro = z.toFixed(1);
      });
      if (sensorTag.type === 'cc2650'){
        console.log('Set Luxometer notification handler...');
        sensorTag.on('luxometerChange', function(lux){
          console.log('\tlx = %d', lux.toFixed(1));
          sensorTagPost.data.data.Luxometer = lux.toFixed(1);
        });
      }
      callback();
    },
    function (callback) {
      console.log('Enabling IR/Temperature Reading...');
      sensorTag.enableIrTemperature(callback);
    },
    function(callback){
      console.log("Enable Accelerometer...");
      sensorTag.enableAccelerometer(callback);
    },
    function(callback){
      console.log("Enable Humidity Sensor... ");
      sensorTag.enableHumidity(callback);
    },
    function(callback){
      console.log("Enable Magnometer...");
      sensorTag.enableMagnetometer(callback);
    },
    function(callback) {
      console.log("Enable Barometric Pressure Sensor...");
      sensorTag.enableBarometricPressure(callback);
    },
    function(callback){
      console.log("Enable Gyroscope...");
      sensorTag.enableGyroscope(callback);
    },
    function(callback){
      if (sensorTag.type === 'cc2650'){
        console.log("Enable Luxometer...");
        sensorTag.enableLuxometer(callback);
      } else {
        callback();
      }
    },
    function(callback){
      setTimeout(callback, 2000);
    },
    function(callback){
      console.log('Set humidity sensor update frequency...');
      sensorTag.setHumidityPeriod(500, function(error){
        sensorTag.notifyHumidity(function(error){
          console.log('Humidity notifications enabled...');
        });
      });
      console.log('Set IR/Temperature Period...');
      sensorTag.setIrTemperaturePeriod(1000, function(error){
        sensorTag.notifyIrTemperature(function(error){
          console.log('IR/Temperature Notifications Enabled');
        });
      });
      console.log('Set accelerometer update frequency...');
      sensorTag.setAccelerometerPeriod(1000, function(error){
        sensorTag.notifyAccelerometer(function(error){
          console.log('Accelerometer notifications enabled...');
        });
      });
      console.log('Set magnetometer update frequency...');
      sensorTag.setMagnetometerPeriod(1000, function(error){
        sensorTag.notifyMagnetometer(function(error){
          console.log('Magnetometer notifications enabled...');
        });
      });
      console.log('Set Barometric Pressure update frequency...');
      sensorTag.setBarometricPressurePeriod(1000, function(error){
        sensorTag.notifyBarometricPressure(function(error){
          console.log('Barometric Pressure notifications enabled...');
        });
      });
      console.log('Set Gyroscope update frequency...');
      sensorTag.setGyroscopePeriod(1000, function(error){
        sensorTag.notifyGyroscope(function(error){
          console.log('Gyroscope notifications enabled...');
        });
      });
      if (sensorTag.type === 'cc2650'){
        sensorTag.setLuxometerPeriod(1000, function(error){
          sensorTag.notifyLuxometer(function(error){
            console.log('Luxometer notifications enabled...');
          });
        });
      }
    },
    function(callback){
      setTimeout(callback, 5000);
    }
    ]
  );
});


function postData(){
  setTimeout(function(){
    sensorTagPost.data.ts = new Date().valueOf();
    c.post(artikCloud, sensorTagPost, function(data, response){

      console.log(data);
    });
    postData();
  }, 600000);
};
postData();
