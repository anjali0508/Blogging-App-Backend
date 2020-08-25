let conn = require("./connection");

let Follower = function(follower) {
  this.user_id = follower.user_id;
  this.follower_id = follower.follower_id;
};

// Get all data in followers table
Follower.getAllFollowers = function(result) {
  conn.query(`SELECT * FROM followers`, (err, res) => {
    if (err) {
      console.log("Error fetching followers: ", err);
      result(err, null);
    } else {
      console.log("Fetched all followers");
      result(null, res);
    }
  });
};

// Add follower
Follower.insertFollower = function(newFollower, result) {
  conn.query(`INSERT INTO followers SET ? `, newFollower, (err, res) => {
    if (err) {
      console.log("Error inserting follower: ", err);
      let error = { message: true, message: err };
      if (err.code == "ER_NO_REFERENCED_ROW_2") {
        error = {
          error: true,
          error: "Foreign key constraint fails"
        };
      } else if (err.code == "ER_BAD_NULL_ERROR") {
        error = {
          error: true,
          message: "Required fields are empty"
        };
      } else if (err.code == "ER_DUP_ENTRY") {
        error = {
          error: true,
          message: "Follower exists"
        };
      }
      result(error, null);
    } else {
      let response = {
        error: false,
        message: "Successfully inserted follower"
      };
      console.log("Successfully inserted follower");
      result(null, response);
    }
  });
};

// Delete follower
Follower.deleteFollower = function(follower_id, user_id, result) {
  conn.query(
    `DELETE FROM followers WHERE user_id = ${user_id} AND follower_id = ${follower_id}`,
    (err, res) => {
      if (err) {
        console.log("Error deleting follower: ", err);
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("Follower not found", null);
        } else {
          console.log("Successfully deleted follower");
          let response = "Successfully deleted follower";
          result(null, response);
        }
      }
    }
  );
};

module.exports = Follower;
