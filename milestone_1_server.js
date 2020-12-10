require("dotenv/config"); // require the dotenv/config at beginning of file

var express = require("express");
var app = express();

// to be able to store hashed passwords
var bcrypt = require("bcrypt");

/* SETTING THE SESSION ***************************************************/

// To use the session we need to 'npm install express-session'
var session = require("express-session");

// set up sessions
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
/*************************************************************************/

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

// set the environment port to connect to (the local port used is saved in .env
//file)
app.set("port", process.env.PORT);

app.post("/getUser", getUser);

// get the messages from the DB
app.post("/getMessages", getMessages);

// before log in, check if the data matches one of the users in the DB
app.post("/checkForUser", checkForUser);

app.post("/addMessageToDB", addMessageToDB);

// // views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// folder where all the static files live
app.use(express.static("public"));

// This shows how to use a middleware function for all requests (it is defined at the end of this file)
// Becuse it comes after the static function call, we won't see it log requests
// for the static pages, only the ones that continue on passed that (e.g., /logout)
app.use(logRequest);

app.post("/signUp", handleSignup);

app.post("/addNewUserToDB", addNewUserToDB);

// Create a Post route for /login
app.post("/logIn", handleLogin);

// Create a Post route for /logout
app.post("/logOut", handleLogout);

app.listen(app.get("port"), function () {
  console.log("Now listening for connections on port: ", app.get("port"));
});

// check if the information given from the user are available to create a new account. If so, add the user and all the info into the DB
function handleSignup(req, res) {
  var newUser = req.body.newUser;
  var newPassword = req.body.newPassword;
  var newNickname = req.body.newNickname;

  checkForExistingUser(
    newUser,
    newPassword,
    newNickname,
    function (error, result) {
      console.log(
        "Back from the getPersonFromDb function with result: ",
        result
      );
      // no user found in the DB, so we can add a new user from here
      if (error || result == null || result.length != 1) {
        console.log(
          "No user has been found. We can now add the information to the DB! The user added will be: " +
            newUser +
            " " +
            newPassword +
            " " +
            newNickname
        );

        addNewUserToDB(
          newUser,
          newPassword,
          newNickname,
          function (error, result) {
            if (error || result == null || result.length != 1) {
              res.json(
                "Unable to create a new user " +
                  "with name " +
                  newUser +
                  " password " +
                  newPassword +
                  " and nickname " +
                  newNickname +
                  "."
              );

              // res.status(500).json({ success: false, data: "No user found!" });
            } else {
              res.json(result[0]);
            }
          }
        );

        // if the user is already existing, send an error message to the user
      } else {
        console.log("The user is already existing! We can't add it to the DB!");
      }
    }
  );
}

// check in the DB an user with the given name and nickname is already existing. If not, add it to the DB.
function checkForExistingUser(newUser, newPassword, newNickname, callback) {
  var sql =
    "SELECT user_id, name_user, nickname FROM chat_user WHERE name_user = $1 OR nickname = $2";

  // parameters saved as array
  var params = [newUser, newNickname];

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

      console.log(
        "Found DB result checkForUserFromDb: " + JSON.stringify(result.rows)
      );
    }
    // once we got the result from DB, we pass it to the checkForUser()
    // function
    callback(null, result.rows);
  });
}

function addNewUserToDB(newUser, newPassword, newNickname, callback) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  var sql =
    "INSERT INTO chat_user(name_user, password, nickname) VALUES($1::text, $2::text, $3::text)";

  var params = [newUser, hashedPassword, newNickname];

  // var params = [newUser, newPassword, newNickname];

  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    }
    // display the result as string from the json string

    console.log(
      "Found DB result addMessageToDB: " + JSON.stringify(result.rows)
    );

    // once we got the result from DB, we pass it to the checkForUser()
    // function
    callback(null, result.rows);
  });
}

// Checks if the username and password match the one in the database
// If they do, put the username on the session
function handleLogin(req, res) {
  console.log("Getting information from current user...");

  var name = req.body.name_user;
  var password = req.body.password;
  // bcrypt.compare(password, hash);
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
      // to store the username into the session
      req.session.user = name;

      console.log("req.session.user: " + req.session.user);

      res.status(200).json(result[0]);
    }
  });
}

//TODO TO BE DEFINED!!
// If a user is currently stored on the session, removes it
function handleLogout(req, res) {
  console.log("Called handleLogout from server side!");
  var result = { success: false };
  // We should do better error checking here to make sure the parameters are present
  if (req.session.user) {
    console.log("req.session.user before destroying: " + req.session.user);

    req.session.destroy();

    result = { success: true };
  }
  res.json(result);
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

function getMessages(req, res) {
  console.log("Getting messages from current user ...");

  // to search for user by id, we need to do the following:
  // var user_id = req.query.user_id;

  var message_user_id = req.body.message_user_id;

  console.log("Retrieving messages with id: ", message_user_id);

  // call the function passing the typed id and the function which displays
  // the result on the console
  getMessagesFromDB(message_user_id, function (error, result) {
    console.log("MESSAGE FROM SERVER (getMessagesFromDB) result: ", result);

    // if (error || result == null || result.length != 1) {
    //   // res.json(
    //   //   "No user found in the database with id " + message_user_id + "."
    //   // );

    //   // to send response 500 error from the server if the user is not found:
    //   // res.status(500).json({ success: false, data: "No user found!" });
    // } else {
    res.json(result);

    // res.render("pages/userFound", result[0]);
    // }
  });
}

function getMessagesFromDB(user_id, callback) {
  var sql =
    "SELECT message_text FROM chat_message WHERE message_user_id = $1::int ORDER BY message_id ASC";
  params = [user_id];

  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred");
      console.log(err);
      callback(err, null);
    } else {
      // display the result as string from the json string

      console.log(
        "Found DB result getMessagesFromDB: " + JSON.stringify(result.rows)
      );
    }
    // once we got the result from DB, we pass it to the checkForUser()
    // function
    callback(null, result.rows);
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
    console.log(
      "Found DB result getUserFromDb: " + JSON.stringify(result.rows)
    );

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
  var sqlPassword = "SELECT password FROM chat_user WHERE name_user = $1";
  var passwordParameter = [name_user];
  var hashedPassword = "";
  pool.query(sqlPassword, passwordParameter, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred");
      console.log(err);
      callback(err, null);
    } else {
      // display the result as string from the json string

      // console.log("Found password from DB: " + JSON.stringify(result.rows));
      if (result.rows[0]) {
        hashedPassword = JSON.stringify(result.rows[0].password);
        console.log("HashedPassword from DB: " + hashedPassword);
      }
    }
    // once we got the result from DB, we pass it to the checkForUser()
    // function

    var sql =
      "SELECT user_id, name_user, password, nickname FROM chat_user WHERE name_user = $1 AND password = $2";

    // here I need to remove the "" of the hashed password which I get from the DB
    var string1 = hashedPassword.replace('"', "");
    var string2 = string1.replace('"', "");
    console.log("HashedPassword from DB: " + string2);
    console.log("password from user: " + password);

    // then, with only the hashed value of the password, I can use the
    // bcrypt.compare method
    bcrypt.compare(password, string2, function (err, isMatch) {
      if (err) {
        throw err;
      } else if (!isMatch) {
        console.log("Password doesn't match!");
        callback(err, null);
      } else {
        console.log("Password matches!");
        // parameters saved as array
        var params = [name_user, string2];

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

            console.log(
              "Found DB result checkForUserFromDb: " +
                JSON.stringify(result.rows)
            );
          }
          // once we got the result from DB, we pass it to the checkForUser()
          // function
          callback(null, result.rows);
        });
      }
    });
  });
}

function addMessageToDB(req, res) {
  var user_id = req.body.message_user_id;
  var user_message = req.body.message_text;
  var sql =
    "INSERT INTO chat_message(message_user_id, message_text) VALUES($1::int, $2::text)";

  var params = [user_id, user_message];
  pool.query(sql, params, function (err, result) {
    if (err) {
      // if an error occurred, display the error to the console, showing what
      // and where occurred.
      console.log("An error with the DB occurred.");
      console.log(err);
      callback(err, null);
    }
    // display the result as string from the json string

    console.log(
      "Found DB result addMessageToDB: " + JSON.stringify(result.rows)
    );

    // once we got the result from DB, we pass it to the checkForUser()
    // function
    res.json(result);
  });
}

// This middleware function simply logs the current request to the server
function logRequest(request, response, next) {
  // the next message will be displayed in the local terminal
  console.log("Received a request for: " + request.url);

  // don't forget to call next() to allow the next parts of the pipeline to function
  next();
}
