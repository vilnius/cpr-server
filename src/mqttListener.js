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

  function updatePiStatus(data) {
    piStatus.findOneAndUpdate({ uid: data.uid }, data, { upsert: true }, (err, doc) => {
      if (err) console.error('Error while trying to update pi status ->', err);
    });
  }

  var topics = ['cpr/+/heartbeat', 'cpr/+/connect', 'cpr/+/disconnect'];

  client.on('connect', () => {
    topics.forEach((topic) => {
      client.subscribe(topic);
    });

    client.on('message', (topic, message) => {
      message = JSON.parse(message);
      message.connected = topic.indexOf("/disconnect") === -1;
      updatePiStatus(message);
    });
  });
}
