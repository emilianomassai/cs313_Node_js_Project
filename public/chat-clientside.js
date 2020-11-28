function searchUser() {
  console.log("Searching user ...");

  // the following is jQuery code to get the value from the text box (from
  // index.html page) and store the value into a local variable
  var user_id = $("#user_id").val();
  console.log("User id: " + user_id);

  // 1. AJAX request to the server to search ///////////////////////////////////
  // In the same way we can do with $post() to interact with the server/////////

  // call the method getUser from milestone_1_server.js and look for an user
  $.post("/getUser", { user_id: user_id }, function (data) {
    console.log("Back from the server with: ");
    console.log(data);

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
        "</li>"
    );
  });
}

function signInUser() {
  console.log("Sign in user ...");

  var name_user = $("#txtUser").val();
  var password_user = $("#txtPassword").val();
  console.log("Looking for", name_user, "with password", password_user);

  $.post("/newGetUser", { name_user: name_user }, function (data) {
    console.log("Back from the server with: ");
    console.log(data);
  });
}
