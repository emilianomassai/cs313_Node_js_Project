var express = require("express");
var app = express();

//import body-parser to be able to use POST instead of GET method
var bodyParser = require("body-parser");

//configure body-parser for express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var params = { txtUser: "" };
// say to the program what kind of database will be used
const { Pool } = require("pg");

// set the database URL (using Heroku, we can just set it to the environment
// variable)
const connectionString = process.env.DATABASE_URL;

// establish the connection to the data source, passing all the data with json:
const pool = new Pool({ connectionString: connectionString });

// set the local and environment port to connect to
app.set("port", process.env.PORT || 5000);

app.post("/getUser", getUser);

// before log in, check if the data matches one of the users in the DB
app.post("/checkForUser", checkForUser);

// add message from user to the DB
app.post("/addMessageToDB", addMessageToDB);

// from index sign-in page, when signing in, the user access to
// the welcome page of the chat app
app.post("/welcome_page", welcomePage);

// // views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// folder where all the static files live
app.use(express.static("public"));

app.listen(app.get("port"), function () {
  console.log("Now listening for connections on port: ", app.get("port"));
});

/*******************************************************************************
 * FUNCTION: welcomePage
 * It checks if the username and password match one user stored in the database.
 * If so, the user is redirected to the "welcome page"
 ******************************************************************************/
function welcomePage(req, res) {
  // create a variable to store the information prompted from the user
  const txtUser = req.body.txtUser;
  const txtPassword = req.body.txtPassword;

  params = { txtUser: txtUser, txtPassword: txtPassword };

  // if (the user and password matches the prompted data from the user){}
  res.render("pages/welcome_page", params);
  //} else {display error res.}
}

/*******************************************************************************
 * FUNCTION: getUser
 * It search for an user by id and pass it to the getUserFromDb to look for the
 * user into the database.
 ******************************************************************************/
function getUser(req, res) {
  console.log("Getting information from current user...");

  // to search for user by id, we need to do the following:
  // var user_id = req.query.user_id;

  var user_id = req.body.user_id;

  console.log("Retrieving person with id: ", user_id);

  // call the function passing the typed id and the function which displays
  // the result on the console
  getUserFromDb(user_id, function (error, result) {
    console.log("Back from the getPersonFromDb function with result: ", result);

    if (error || result == null || result.length != 1) {
      res.json("No user found in the database with id " + user_id + ".");

      // to send response 500 error from the server if the user is not found:
      // res.status(500).json({ success: false, data: "No user found!" });
    } else {
      res.json(result[0]);

      // res.render("pages/userFound", result[0]);
    }
  });
}

/*******************************************************************************
 * FUNCTION: checkForUser
 * This function is used from "signInUser()" function when the user press the
 * "Sign In" button of the index.html page.
 * It stores the data passed from "SignInUser()" and sends those values to
 * "checkForUserFromDb()". With the callback function, we will get the results
 * from the DB, once the data has been verified.
 ******************************************************************************/
function checkForUser(req, res) {
  console.log("Getting information from current user...");

  var name = req.body.name_user;
  var password = req.body.password;
  // call the function passing the typed id and the function which displays
  // the result on the console
  checkForUserFromDb(name, password, function (error, result) {
    console.log("Back from the getPersonFromDb function with result: ", result);

    if (error || result == null || result.length != 1) {
      res.json(
        "No user found in the database with name" +
          name +
          " and password " +
          password +
          "."
      );

      // res.status(500).json({ success: false, data: "No user found!" });
    } else {
      res.json(result[0]);
    }
  });
}
/*******************************************************************************
 * FUNCTION: getUserFromDb
 * It interact with the postgresql database, using a pool query with the
 * user_id parameter saved in the array. If the function finds a matching user,
 * it will display the related values as string.
 ******************************************************************************/
// define the getPersonFromDb function used above
function getUserFromDb(user_id, callback) {
  console.log("getUserFromDb called with id: ", user_id);

  // sequel, declaring that the passed id will be an integer and it will be
  // passed as first parameter
  var sql =
    "SELECT user_id, name_user, password, nickname FROM chat_user WHERE user_id = $1::int";

  // parameters saved as array (in this case we have only a value, id)
  var params = [user_id];

  // postgres module, please go and run this query (sql) with this parameters (params) and when is done call the callback function
  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred");
      console.log(err);
      callback(err, null);
    }

    // display the result as string from the json string
    console.log("Found DB result: " + JSON.stringify(result.rows));

    // once we got the result from DB, we pass it to the getUserFromDb
    // function
    callback(null, result.rows);
  });
}

/*******************************************************************************
 * FUNCTION: checkForUserFromDb
 * This function is called from "checkForUser()". It takes the name_user and
 * password from the user input and creates a query for the database.
 * If the parameters match to one of the users in the database, the result is
 * sent back to "checkForUser()". A "null" result is sent otherwise.
 ******************************************************************************/
function checkForUserFromDb(name_user, password, callback) {
  // select from the database the correct user
  var sql =
    "SELECT user_id, name_user, password, nickname FROM chat_user WHERE name_user = $1 AND password = $2";

  // parameters saved as array
  var params = [name_user, password];

  // postgres module, please go and run this query (sql) with this parameters (params) and when is done call the callback function
  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred");
      console.log(err);
      callback(err, null);
    } else {
      // display the result as string from the json string

      console.log("Found DB result: " + JSON.stringify(result.rows));
    }
    // once we got the result from DB, we pass it to the checkForUser()
    // function
    callback(null, result.rows);
  });
}

function addMessageToDB(message_user_id, message_text) {
  // var id_user = 1;
  // var message = "From addMessageToDB local var the message is saved!";
  console.log(
    "FROM addMessageToDB: message_user_id: " +
      message_user_id +
      " message_text: " +
      message_text
  );

  var sql =
    "INSERT INTO chat_message(message_user_id, message_text) VALUES($1::int, $2::text)";
  // var params = [id_user, message];
  var params = [message_user_id, message_text];

  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    } else {
      // display the result as string from the json string

      console.log("Found DB result: " + JSON.stringify(result.rows));
    }
    // once we got the result from DB, we pass it to the checkForUser()
    // function
    callback(null, result.rows);
  });
}
