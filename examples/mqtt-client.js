// mqtt client example
var mqtt, regData, connOpt, fakeId;

fakeClientId = '001';

mqtt = require('mqtt');

regData = JSON.stringify({
  id: fakeClientId,
  ip: '0.0.0.0'
});

connOpts = {
  will: {
    topic: 'unreg',
    payload: JSON.stringify({id: fakeClientId})
  }
};

client = mqtt.connect('mqtt://127.0.0.1:1883', connOpts);

client.on('connect', function () {
  client.publish('reg', regData);
});
