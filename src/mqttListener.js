import * as mqtt from 'mqtt';
import {piStatus} from './models';

export default function () {

  var client = mqtt.connect('mqtt://127.0.0.1:1883');

  var topicHandlers = {

    reg: function (message) {
      var query;

      message.connected = true;
      query = { id: message.id };

      piStatus.findOneAndUpdate(query, message, { upsert: true }, function (err, doc) {
        if (err) console.error('error while trying to update connected pi status ->', err);
      });
    },

    unreg: function (message) {
      var query;

      message.connected = false;
      query = { id: message.id };

      piStatus.findOneAndUpdate(query, message, { upsert: false }, function (err, doc) {
        if (err) console.error('error while trying to update disconnected pi status ->', err);
      });
    }
  };

  client.on('connect', function () {

    Object.keys(topicHandlers).forEach(function (topicKey, idx) {
      client.subscribe(topicKey);
    });

    client.on('message', function (topic, message) {
      message = JSON.parse(message);
      topicHandlers[topic](message);
    });
  });
}
