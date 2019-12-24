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

class ClientMQTT {
  constructor() {
    this.options = {
      port: 1883,
      host: "192.168.0.10",
      clientId: makeid(20),
      //username: "user",
     //password: "ZW8W3dQa",
      keepalive: 60,
      reconnectPeriod: 1000,
      rejectUnauthorized: true,
      protocol: 'mqtt'
    }
    this.started = 0
  }

  topic_handler(topic, message) {
  	try {
      console.log("Received a new message from %o - %o", topic.toString(), message.toString());
      // var msg_type = topic.split('/')[3]
      // let json_msg = JSON.parse(message)
      // var power_value = {
      //       // For example, enodeX
      //       node: topic.split('/')[1],
      //       // For ex, portX
      //       port: topic.split('/')[2],
      //       port2: topic.split('/')[3],
      //       time: json_msg.timeStamp,
      //       // power
      //       value: json_msg.value
      //     }
      this.handler(topic.toString(), message.toString())

    } catch(e) {
      console.log(e);
    }
  }

  publish(topic_inner, value) {
    console.log("publish is hooked " + value)
    let topic = topic_inner
    let payload = value
    this.Client.publish(topic, payload)
  }

  connected() {
    this.started = 1
    console.log("Connected to the broker!")
    //TODO change to topic, # for
    this.Client.subscribe("/testbed/+/finance")
    this.Client.subscribe("/testbed/emeter1/power")
    this.Client.subscribe("/testbed/emeter2/power")
    this.Client.subscribe("/testbed/emeter3/power")
    this.Client.subscribe("/testbed/emeter4/power")
    this.Client.subscribe("/testbed/+/relay/+/status")
    this.Client.subscribe("/testbed/+/ext_battery/power")
    this.Client.subscribe("/testbed/+/load/+/status")
    this.Client.subscribe("/testbed/+/+/measure")
    this.Client.subscribe("/testbed/relay/+/mode")
    this.Client.subscribe("/testbed/relay/+/status")
    this.Client.subscribe("/testbed/+/+/power")
    this.Client.subscribe("/testbed/amigo/set_price")
    this.Client.subscribe("/testbed/erouter/setpower_out")
    this.Client.subscribe("/testbed/+/gen/parameter0")


    this.Client.subscribe("/testbed/+/contracts/+/init")
    this.Client.subscribe("/testbed/+/known_agents")

    this.Client.on('message', this.topic_handler.bind(this))
  }


  add_handler(handler) {
    this.handler = handler
  }

  start() {
    console.log("Starting MQTT client")
    this.Client = mqtt.connect(this.options)
    this.Client.on('connect', this.connected.bind(this))
  }

  stop() {
    this.Client.end()
  }
}


module.exports = {
  ClientMQTT
}
