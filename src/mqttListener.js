import * as mqtt from 'mqtt';

import { piStatus } from './models';
import { MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD } from '../config';

export default function setupMqttListener() {

  var client = mqtt.connect({
      host: MQTT_HOST,
      port: MQTT_PORT,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD
  });

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
