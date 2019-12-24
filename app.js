var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let mqtt_client_google = require('./mqtt_client_google')
let mqtt_client_local = require('./mqtt_client_local')
const Sequelize = require('sequelize');
const DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/onder_between';
const database = new Sequelize(DATABASE_URL);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const Topics = database.define(
  'topics',
  {
    topic: {
      type: Sequelize.TEXT
    },
    value: {
      type: Sequelize.TEXT
    }
  },
  { timestamps: false }
);

Topics.readAll = async (req, res) => {
  try {
    const topic = await Topics.findAll();
    return res.send({ topic });
  } catch (error) {
    return res.send(error);
  }
};

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/topics', Topics.readAll);

const mqtt = new mqtt_client_google.ClientMQTT()
mqtt.add_handler(handler)
mqtt.start()

const mqttLocal = new mqtt_client_local.ClientMQTTLocal()
mqttLocal.start()

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function handler(type, mes) {
  console.log("Receive new message %o ", mes)
  var date = new Date();
  var timestamp = date.getTime();
  let topic = type
  var value_from_bd = undefined;
  console.log("topic.split('/')[2] ", topic.split('/')[2])
  if(!(topic.split('/')[3]=="known_agents" || topic.split('/')[3]=="contracts")) {


  const value_from_topic = JSON.parse(mes).value;
  console.log("value_from_topic " + value_from_topic);

  try {
    const topics = await Topics.findOne({
      where: {
        topic: type
      }
    });

      const json_msg = JSON.parse(topics.value)
      console.log("json_msg " + json_msg)
      value_from_bd = json_msg.value
      console.log("value_from_bd first catch " + value_from_bd);

  } catch (ex) {
    Topics.upsert({ topic: type, value: mes});
    console.log(ex.toString())
  }

  try {
    console.log("value_from_bd " + value_from_bd);
    console.log("value_from_topic " + value_from_topic);
    console.log("compare " + (value_from_bd==value_from_topic));
    if(value_from_bd==value_from_topic){

    } else {
      Topics.destroy({
        where: {
          topic: type
        }
      }).then(function(topic){ // rowDeleted will return number of rows deleted
        if(topic === 1){
           console.log('Deleted successfully');
         }
      }, function(err){
          console.log(err);
      });
      Topics.upsert({ topic: type, value: mes});
      mqttLocal.publish(type, mes)
    }

  } catch (ex) {
    console.log(ex.toString())
  }
} else {
  mqttLocal.publish(type, mes)
}
}

app.listen(process.env.PORT || 3006, function() {
  console.log("Server started on %o", process.env.PORT);
})

module.exports = app;
