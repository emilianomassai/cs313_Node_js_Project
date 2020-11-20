var express = require("express");
var app = express();

// say to the program what kind of database will be used
const { Pool } = require("pg");

// set the database URL (using Heroku, we can just set it to the environment
// variable)
const connectionString = process.env.DATABASE_URL;

// establish the connection to the data source, passing all the data with json:
const pool = new Pool({ connectionString: connectionString });

// set the local and environment port to connect to
app.set("port", process.env.PORT || 5000);

app.get("/getUser", getUser);
app.get("/sign_in", signIn);

// views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// folder where all the static files live
app.use(express.static("public"));

app.listen(app.get("port"), function () {
  console.log("Now listening for connections on port: ", app.get("port"));
});

function signIn(req, res) {
  res.render("pages/sign_in");
}

/*******************************************************************************
 * FUNCTION: getUser
 * It search for an user by id and pass it to the getUserFromDb to look for the
 * user into the database.
 ******************************************************************************/
function getUser(req, res) {
  console.log("Getting information from current user...");

  // to search for user by id, we need to do the following:
  var user_id = req.query.user_id;
  console.log("Retrieving person with id: ", user_id);

  // call the function passing the typed id and the function which displays
  // the result on the console
  getUserFromDb(user_id, function (error, result) {
    console.log("Back from the getPersonFromDb function with result: ", result);

    if (error || result == null || result.length != 1) {
      res.status(500).json({ success: false, data: error });
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
    "SELECT user_id, name_user, password, nickname FROM chat_user WHERE user_id = 1";

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
