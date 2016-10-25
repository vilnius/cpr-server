// mqtt client example
var mqtt = require('mqtt');
var os = require('os');
var dns = require('dns');

var clientId = '003';
var brokerUrl = 'mqtt://195.182.82.79:1883';

var connOpts = {
  will: {
    topic: 'unreg',
    payload: JSON.stringify({id: clientId})
  }
};

var hostname = os.hostname();
var client = mqtt.connect(brokerUrl, connOpts);

dns.lookup(hostname, function (err, ipAddress) {
  if (err) throw err;

  var message = {
    id: clientId,
    ip: ipAddress,
    data: {
      hostname: hostname,
      uptime: os.uptime(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      load: os.loadavg()
    }
  };

  client.on('connect', function () {
    console.log("Sending data: ", message);
    client.publish('reg', JSON.stringify(message));
  });
});
