var express = require("express");
var app = express();

// set the local and environment port to connect to
app.set("port", process.env.PORT || 5000);

app.get("/getHello", sayHello);

// folder where all the static files live
app.use(express.static("public"));

app.listen(app.get("port"), function () {
  console.log("Now listening for connections on port: ", app.get("port"));
});

function sayHello(req, res) {
  console.log("Look at the browser window...");
  res.send("Hello World!");
}
