const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const http = require("http")
const socketio = require('socket.io');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const app = express();
app.use(jsonParser)

const server = http.createServer(app);
const io = socketio(server);

mongoose.Promise = global.Promise;

const uri = "mongodb://localhost:27017/testData";
mongoose
    .connect(uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(
      () => {
        console.log("Connected to Mongo");
      },
      (err) => {
        console.log("error connecting to Mongo: ");
        console.log(err)
      }
);
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public/"));
app.use('/', require('./routes/index.js'));

const Message = require("./models/Message");

io.on('connection', socket => {

  Message.find().then(chatdata => {
    io.to(socket.id).emit('chatdata', {chatdata})
  })
  socket.on('chatMessage', msg => {
    let message = new Message({
      text : msg,
    })
    message
      .save()
      .then(message => {
        io.emit('message', message);
      })
   })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
