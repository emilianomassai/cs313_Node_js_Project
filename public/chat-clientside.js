function signUp() {
  console.log("Adding new user to database ...");

  // getting the values from the user form...
  var newUser = $("#newUser").val();
  var newPassword = $("#newPassword").val();
  var newNickname = $("#newNickname").val();

  // .. get ready for send the new values to the server
  var params = {
    newUser: newUser,
    newPassword: newPassword,
    newNickname: newNickname,
  };
  if (newUser == "" || newPassword == "" || newNickname == "") {
    console.log(
      "You need to fill all the requested information to create a new account!"
    );
    $("#newUserErrorMessage").html(
      "You need to fill all the requested information to create a new account!"
    );
  } else {
    console.log(
      "The user filled the fields correctly. Checking if all the info are correct and if there isn't another user with the same name in the DB..."
    );
    $.post("/signUp", params, function (data) {
      console.log("Back from the server with: ");
      console.log("loggedIn: " + data);

      if (!data.name_user) {
        console.log("ADDED NEW USER!");
        $("#newUserErrorMessage").html(
          "The new user has been successfully created! Please log in to use the app."
        );
      } else if ((status = 200)) {
        console.log(data);
        console.log("THIS USER IS ALREADY EXISTING!");

        var user_id = data.user_id;
        var name = data.name_user;
        var nickname = data.nickname;
        var password = data.password;
      }
    });
  }
}

function logIn() {
  console.log("Searching user ...");

  console.log("Sign in user ...");

  var name_user = $("#txtUser").val();
  var password = $("#txtPassword").val();
  // var message_user = $("#txtMessage").val();

  var params = {
    name_user: name_user,
    password: password,
  };

  if (name_user == "" || password == "") {
    console.log("Please fill all the requested information!");
    $("#resultFromServer").html("Please fill all the requested information!");
  } else {
    console.log("Form filled as required. Looking for some data ...");
    console.log("Looking for", name_user, "with password", password);

    $.post("/login", params, function (data) {
      console.log("Back from the server with: ");
      console.log("loggedIn: " + data);

      if (!data.name_user) {
        console.log("No user in DB");

        $("#resultFromServer").html(
          "User name and password do not match! Please try again."
        );
      } else if ((status = 200)) {
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
          "Hi " + name + "," + " you are logged in. You can now send a message!"
        );

        // as the user is logged in, all the messages are displayed
        searchMessages(data.user_id);
      }
    });
  }
}

function logOut() {
  console.log("Called logOut from client side!");
  $.post("/logout", function (result) {
    console.log("Getting back response from server: " + result);

    // to clear the username, password and message when the user log out
    $("#txtUser").val("");
    $("#txtPassword").val("");
    $("#txtMessage").val("");
    // delete also all the displayed messages
    $("#sendMessageOutput").html("");

    if (result && result.success) {
      $("#resultFromServer").text("Successfully logged out.");
    } else {
      $("#resultFromServer").text("You are already logged out!");
    }
  });
}

function searchMessages(user_id) {
  console.log(
    "FROM searchMessages: retrieving all the messages from user with id: ",
    user_id
  );

  $.post("/getMessages", { message_user_id: user_id }, function (messages) {
    console.log("Back from the server with: ");
    console.log(messages[0]);

    $("#sendMessageOutput").html("");
    // then loop through the messages received from the database
    for (var i = 0; i < messages.length; i++) {
      // console.log(messages[i]);
      $("#sendMessageOutput").append(messages[i].message_text + "<br><br>");
    }

    // to clear the message textbox when the message is sent to DB
    $("#txtMessage").val("");
    // var message = data.message_text;

    // $("#resultFromServer").html("Message found: " + message);
  });
}

/****************************************************************************
 * FUNCTION: SIGN IN USER
 * This function takes the username and password prompted from the user and
 * call send the values to other functions to check if the data match to
 * the one in the database.
 ***************************************************************************/
function sendMessage() {
  console.log("Sending message in user ...");

  var name_user = $("#txtUser").val();
  var password_user = $("#txtPassword").val();
  var message_user = $("#txtMessage").val();

  if (name_user == "" || password_user == "" || message_user == "") {
    console.log(
      "To send a message, please make sure that you are logged in and the message contain some text."
    );
    $("#sendMessageOutput").html(
      "To send a message, please make sure that you are logged in and the message contain some text."
    );
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
