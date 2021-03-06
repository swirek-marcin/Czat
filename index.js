const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require("./UsersService");

const userService = new UsersService();

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  // server client is listening of an entering chat msgs
  socket.on("join", function(name) {
    // user, which appeared  in an App will be hold in special list of chat users
    userService.addUser({
      id: socket.id,
      name
    });
    // App emits update event, which is updating info about users list to anyone who is listening to an 'update' event
    io.emit("update", {
      users: userService.getAllUsers()
    });
  });
});

io.on("connection", function(socket) {
  socket.on("disconnect", () => {
    userService.removeUser(socket.id);
    socket.broadcast.emit("update", {
      users: userService.getAllUsers()
    });
  });
});

io.on("connection", function(socket) {
  socket.on("message", function(message) {
    const { name } = userService.getUserById(socket.id);
    socket.broadcast.emit("message", {
      text: message.text,
      from: name
    });
  });
});

server.listen(3000, function() {
  console.log("listening on *:3000");
});
