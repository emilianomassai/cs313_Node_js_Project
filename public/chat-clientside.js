function searchUser() {
  console.log("Searching user ...");

  // the following is jQuery code to get the value from the text box (from
  // index.html page) and store the value into a local variable
  var user_id = $("#user_id").val();
  console.log("User id: " + user_id);

  if (user_id == "" || isNaN(user_id)) {
    console.log("Please enter an user id!");
    $("#resultFromServer").html("Please enter a valid user id!");
  } else {
    // 1. AJAX request to the server to search ///////////////////////////////////
    // In the same way we can do with $post() to interact with the server/////////

    // call the method getUser from milestone_1_server.js and look for an user
    $.post("/getUser", { user_id: user_id }, function (data) {
      console.log("Back from the server with: ");

      if (!data.name_user) {
        console.log("No user in DB");

        $("#resultFromServer").html(
          "No user found in the database with this id!"
        );
      } else {
        console.log(data);

        var user_id = data.user_id;
        var name = data.name_user;
        var nickname = data.nickname;
        var password = data.password;

        // 2. Getting the data back from the server ////////////////////////////////

        // for loop to get elements of the list and take them out
        // each of them as we go, to be able to display them into the html page

        // 3. Using the results to update the HTML page //////////////////////////

        $("#resultFromServer").html(
          "An user is found in our database with the following info: " +
            "<br>" +
            "<li>" +
            "Username: " +
            name +
            "</li>" +
            "<li>" +
            "Nickname: " +
            nickname +
            "</li>" +
            "<li>" +
            "Password: " +
            password +
            "</li>" +
            "<li>" +
            "User Id: " +
            user_id +
            "</li>"
        );
      }
    });
  }
}

function searchMessages(user_id) {
  console.log(
    "FROM displayAllMessages: retrieving all the messages from user with id: ",
    user_id
  );

  $.post("/getMessages", { message_user_id: user_id }, function (data) {
    console.log(data);
    console.log("Back from the server with: ");

    if (!data.message_user_id) {
      console.log("No message found!");

      $("#resultFromServer").html("No message found in the database!");
    } else {
      console.log(data);

      var message_user_id = data.message_user_id;
      var message_text = data.message_text;

      // 2. Getting the data back from the server ////////////////////////////////

      // for loop to get elements of the list and take them out
      // each of them as we go, to be able to display them into the html page

      // 3. Using the results to update the HTML page //////////////////////////

      $("#sendMessageOutput").html(
        "The messages from the DB are: " + "<br>" + "<li>" + "User ID: "
        // +
        //   message_user_id +
        //   "Message: " +
        //   message_text +
        //   "</li>"
      );
    }
  });
}

/****************************************************************************
 * FUNCTION: SIGN IN USER
 * This function takes the username and password prompted from the user and
 * call send the values to other functions to check if the data match to
 * the one in the database.
 ***************************************************************************/
function signInUser() {
  console.log("Sign in user ...");

  var name_user = $("#txtUser").val();
  var password_user = $("#txtPassword").val();
  var message_user = $("#txtMessage").val();

  if (name_user == "" || password_user == "" || message_user == "") {
    console.log("Please fill all the requested information!");
    $("#sendMessageOutput").html("Please fill all the requested information!");
  } else {
    console.log("Form filled as required. Looking for some data ...");
    console.log("Looking for", name_user, "with password", password_user);

    $.post(
      "/checkForUser",
      { name_user: name_user, password: password_user },
      function (data) {
        if (!data.name_user) {
          console.log("The current user is not signed in!");

          $("#sendMessageOutput").html(
            "Please enter your username and password to be able to send a message!"
          );
        } else {
          console.log("Back from the server with name user: ");
          console.log(data);

          // TODO use the data.user_id to add the message to the right user
          saveMessageToDB(data.user_id, message_user);

          // using the user id, search for all the messages in the database matching this user.
          searchMessages(data.user_id);
          console.log(
            "Message added from user_id: " +
              data.user_id +
              " with content: " +
              message_user
          );
        }
      }
    );
  }
}

function saveMessageToDB(user_id, message_user) {
  console.log(
    "FROM saveMessageToDB: Adding to user with id ",
    user_id,
    " the following message: ",
    message_user
  );
  $.post(
    "/addMessageToDB",
    { message_user_id: user_id, message_text: message_user },
    function (data) {
      console.log("From the server with name user: ");
      console.log(data);

      // TODO use the data.user_id to add the message to the right user
    }
  );
}
