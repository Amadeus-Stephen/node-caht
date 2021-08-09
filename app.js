const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const http = require("http")
const socketio = require('socket.io');
const bodyParser = require('body-parser')
const Chatroom = require("./models/Chatroom");
const jsonParser = bodyParser.json();
const app = express();
app.use(jsonParser)
app.use(express.static(__dirname + "/public"))
// require('./config/passport')(passport);
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
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
// app.use(
//   session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { sameSite: 'strict' }
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());
// app.use(function(req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });
app.use(express.static(__dirname + "/public/"));
// app.use('/', require('./routes/index.js'));
// app.use('/users', require('./routes/users.js'));
// app.use('/', require('./routes/chatroom.js'));


async function chatid() {
    let chatpromise = new Promise( (resolve , rej) => 
    {

    Chatroom.find({name: "main"}).then((chatroom) => {
    if (chatroom.length == 0) {
      let new_chatroom = new Chatroom({name: "main"})
      new_chatroom.save()
      resolve(new_chatroom)

    }
    else 
    {
      
      resolve(chatroom[0])
    }})

    })
    chatpromise.then((data) => {
      console.log(data._id)
    })
}
chatid()
app.get("/", (req, res) => {
  Chatroom.find({name: "main"})
  .then((chatroom) => res.json(chatroom))
  .catch((err) => res.status(400).json(`Error: ${err}`));
})
// app.use()
const botName = 'ChatCord Bot';
const Message = require("./models/Message");
const { resourceUsage } = require('process');

function socketServer(id) {
io.on('connection', socket => {
  socket.on('joinRoom', ({ name, room }) => {
    const user = userJoin(socket.id, name, room);
    // console.log(user)
    socket.join("main");
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
    // socket.broadcast
    //   .to(user.room)
    //   .emit(
    //     'message',
    //     formatMessage(botName, `${user.name} has joined the chat`)
    //   );
    Message.find({chat:"main"}).then(chatdata =>  {
      console.log("main", chatdata)
      io.to(socket.id).emit('chatdata' , { chatdata })
    })
  });
  socket.on('chatMessage', msg => {
    let message = new Message({
      // chat:  user.room,
      // name : user.name,
      text : msg,
    })
    message
      .save()
      .then(message => {
        io.to().emit('message', message);
      })
   })
  // socket.on('disconnect', () => {
  //   const user = userLeave(socket.id);
  //   if (user) {
  //     io.to(user.room).emit(
  //       'message',
  //       formatMessage(botName, `${user.name} has left the chat`)
  //     );
  //     io.to(user.room).emit('roomUsers', {
  //       room: user.room,
  //       users: getRoomUsers(user.room)
  //     });
  //   }
  // });
});

}
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
