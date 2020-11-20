var express = require("express");
var app = express();

// to use real time chat feature, passing the port we want to
// use for socket.io
var socket = require("socket.io")(process.env.PORT || 5000);

// set the local and environment port to connect to
app.set("port", process.env.PORT || 5000);

app.get("/getHello", sayHello);

// folder where all the static files live
app.use(express.static("public"));

// views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.listen(app.get("port"), function () {
  console.log("Now listening for connections on port: ", app.get("port"));
});

function sayHello(req, res) {
  console.log("Look at the browser window...");
  res.send("Hello World!");
}

// every time an user loads the server, the app will load this
// function, giving to each user their own socket.
socket.on(
  "connection",
  // then, we can send a message to the user, using this socket
  (socket) => {
    socket.emit(
      "chat-message",
      "Now listening for connections on port: ",
      app.get("port")
    );
  }
);
