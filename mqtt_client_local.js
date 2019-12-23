const mqtt = require('mqtt')

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class ClientMQTTLocal {
  constructor() {
    this.options = {
      port: 1883,
      host: "35.223.170.49",
      clientId: makeid(20),
      username: "user",
     password: "ZW8W3dQa",
      keepalive: 60,
      reconnectPeriod: 1000,
      rejectUnauthorized: true,
      protocol: 'mqtt'
    }
    this.started = 0
  }


  publish(topic_inner, value) {
    console.log("publish is hooked from mqtt local" + value)
    let topic = topic_inner
    let payload = value
    this.Client.publish(topic, payload)
  }

  connected() {
    this.started = 1
    console.log("Connected to the broker! LOCAL")
  }


  start() {
    console.log("Starting MQTT client LOCAL")
    this.Client = mqtt.connect(this.options)
    this.Client.on('connect', this.connected.bind(this))
  }

  stop() {
    this.Client.end()
  }
}


module.exports = {
  ClientMQTTLocal
}
