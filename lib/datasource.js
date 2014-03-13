
exports.create = function (callback) {
  var cmdArguments = ['-c', 'sudo ~/minimu9-ahrs/minimu9-ahrs -b /dev/i2c-1 --output euler'];
  var rl = require('readline');

  var ahrssource = require('child_process').spawn('sh', cmdArguments);
  linereader = rl.createInterface(ahrssource.stdout, ahrssource.stdin);

  linereader.on('line', function (line) {
    var values = line.replace(/ +(?= )/g,'').split(' ');
    var offset = values[0] === '' ? 1 : 0;
    callback({
      pitch: Number(values[offset]), 
      yaw: Number(values[offset+1]), 
      roll: Number(values[offset+2]), 
      accelX: Number(values[offset+3]), 
      accelY: Number(values[offset+4]), 
      accelZ: Number(values[offset+5]),
      gyroX: Number(values[offset+6]),
      gyroY: Number(values[offset+7]),
      gyroZ: Number(values[offset+8])
    });
//    console.log(values[offset] + ' ' + values[offset+1] + " " +values[offset+2]);
  });

  ahrssource.stderr.on('data', function (data) {
    console.log('ahrs-err:' + data);
  });

  ahrssource.on('close', function (code) {
    console.log('ahrs process exited with code ' + code);
  });

  return ahrssource;
};

