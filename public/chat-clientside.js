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

function saveMessageToDB(user_id, message) {
  console.log("Saving message ...");

  console.log(
    "Adding to user with id ",
    user_id,
    " the following message: ",
    message
  );

  $.post(
    "/addMessageToDB",
    { message_user_id: user_id, message_text: message },
    function (data) {
      console.log("Back from the server with name user: ");
      console.log(data);

      // TODO use the data.user_id to add the message to the right user
      console.log(
        "Message added from user_id: " +
          data.user_id +
          " with content: " +
          message_user
      );
    }
  );
}
