import * as mqtt from 'mqtt';
import {piStatus} from './models';

export default function setupMqttListener() {

  var client = mqtt.connect('mqtt://127.0.0.1:1883');

  var topicHandlers = {

    reg: (message) => {
      var query;

      message.connected = true;
      query = { id: message.id };

      piStatus.findOneAndUpdate(query, message, { upsert: true }, (err, doc) => {
        if (err) console.error('error while trying to update connected pi status ->', err);
        else console.log(doc);
      });
    },

    unreg: (message) => {
      var query;

      message.connected = false;
      query = { id: message.id };

      piStatus.findOneAndUpdate(query, message, { upsert: false }, (err, doc) => {
        if (err) console.error('error while trying to update disconnected pi status ->', err);
        else console.log(doc);
      });
    }
  };

  client.on('connect', () => {

    Object.keys(topicHandlers).forEach((topicKey) => {
      client.subscribe(topicKey);
    });

    client.on('message', (topic, message) => {
      message = JSON.parse(message);
      topicHandlers[topic](message);
    });
  });
}
