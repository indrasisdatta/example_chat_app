var express  	  = 	require('express');
var mongoose 	  = 	require('mongoose');
var bodyParser 	= 	require("body-parser");

var app    =   express();
var http   =   require('http').Server(app);
var io 		 =	 require('socket.io')(http);

var Chats = mongoose.model("Chats", {
  name: String,
  chat: String
});

var userList = [];

io.on('connection', (socket) => {  

  /* 1. New user joined chat */

  socket.on('init', function(userData) {
      
      userList = userList.filter(userList => userList.username != userData.username);

      userList.push(userData);

      // socket.broadcast because we need to notify all other user except the new user

      socket.broadcast.emit('new_user_joined', {userList: userList, newUser: userData});
  });

  /* -------- 2. New chat msg obj from user -------- */

  socket.on('chat_message', function(data) {

    console.log('New chat obj ---> '); console.log(data);

    io.emit('chat_message', data);
    
    // var chat = new Chats(data);
    // chat.save(function(err, chat) {
    //   if (err) {
    //     return res.status(401).send({message: err});
    //   } else {
    //     io.emit('chat message', data);
    //   }
    // });

  });

  /* -------- 3. Use typing message ------------- */

  socket.on('typing', function(data) {
    // socket.emit('typing', data);
    socket.broadcast.emit('typing', data);
  });

  /* -------- 4. Socket disconnect event -------- */

  socket.on('disconnect', function() { 

    var disconnected_username = '';
    
    for (var i = 0; i < userList.length; i++) {
      if (userList[i].socket_id == socket.id) {
        disconnected_username = userList[i].username;
        break;
      }
    }
    
    io.emit('user_disconnected', {'msg': disconnected_username + ' is offline.'});
  });
});

io.on('typingMessage', function(data) {
  socket.broadcast.emit('typingMessage', {msg: 'Typing msg...'});
});

// var server = http.listen(3020, () => {
// 	console.log('Listening on port' + server.address().port);
// });

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/chats', (req, res) => {
	Chats.find({}, (error, chats) => {
		res.send(chats);
	});
});

// Build the connection string 
var dbURI = 'mongodb://localhost:27017/demo_chatapp'; 

// Create the database connection 
mongoose.connect(dbURI); 

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});

// app.listen(3020, () => {
// 	console.log('I am listening at http://localhost:3020');
// });

var server = http.listen(3000, () => {
  // http.close();
  console.log("Well done, now I am listening on ", server.address().port)
})