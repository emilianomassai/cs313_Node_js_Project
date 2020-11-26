function searchUser() {
  console.log("Searching user ...");

  // the following is jQuery code to get the value from the text box (from
  // scriptures.html page) and store the value into a local variable
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

    if (!data) {
      $("#resultFromServer").html(
        "No user found with Id: " +
          user_id +
          ". Please choose another Id and try again!"
      );
    } else {
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
    }
    //       console.log(scripture);

    //     // select the list on the scriptures.html page where to display the
    //     // results
    //     // $("#ulScriptures").append("<li>item1</li>");
    //     // $("#ulScriptures").append("<li>item2</li>");
    //     // $("#ulScriptures").append("<li>item3</li>");
  });
}
