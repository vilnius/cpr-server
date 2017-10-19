// mqtt client example
var mqtt = require('mqtt');
var os = require('os');
var dns = require('dns');

var config = require('./config.js');

var uid = '00000003';

var client = mqtt.connect({
  host: config.MQTT_HOST,
  port: config.MQTT_PORT,
  username: config.MQTT_USERNAME,
  password: config.MQTT_PASSWORD,
  will: {
    topic: `cpr/${uid}/disconnect`,
    payload: JSON.stringify({uid: uid})
  }
});

var hostname = os.hostname();

dns.lookup(hostname, function (err, ipAddress) {
  if (err) throw err;

  function sendHeartbeat() {
    var message = {
      uid: uid,
      vpnIp: ipAddress,
      version: '1.0.0',
      hostname: hostname,
      freemem: os.freemem(),
      uptime: os.uptime(),
      temp: '57.5',
      gps: {
        inPolygon: false,
        hdop: 0.86,
        satelites: 9
      }
    };
    console.log("Sending message: ", message);
    client.publish(`cpr/${uid}/heartbeat`, JSON.stringify(message));
  }

  client.on('connect', function () {
    sendHeartbeat();
    setTimeout(sendHeartbeat, 1000);
    setTimeout(sendHeartbeat, 2000);
    setTimeout(sendHeartbeat, 4000);
    setTimeout(sendHeartbeat, 8000);
    setTimeout(process.exit, 10000);
  });
});
