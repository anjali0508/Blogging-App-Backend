let conn = require("./connection");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let config = require("../config");

const saltRounds = 10;
const key = config.key;

let User = function(user) {
  this.user_id = user.user_id;
  this.email = user.email;
  this.username = user.username;
  this.password = user.password;
  this.about = user.about;
  this.profile_image_url = user.profile_image_url;
};

// Insert user
// Sign up
User.insertUser = function(newUser, result) {
  let passwordHash = bcrypt.hashSync(newUser.password, saltRounds);
  conn.query(
    `INSERT INTO users (username, email, password, profile_image_url) VALUES ( ?, ?, ?, " " ) `,
    [newUser.username, newUser.email, passwordHash],
    (err, res) => {
      if (err) {
        console.log("Error inserting user: ", err);
        let error = { error: true, message: err };
        if (err.code == "ER_DUP_ENTRY") {
          error = {
            error: true,
            message: "Account for the given email ID already exists"
          };
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          error = {
            error: true,
            message: "Required fields are empty"
          };
        }
        result(error, null);
      } else {
	console.log("Signed in");
        User.login(newUser.email, newUser.password, result);
      }
    }
  );
};

User.login = function(email, password, result) {
  conn.query(
    `
    SELECT user_id, email, password, username, profile_image_url
    FROM users
    WHERE email = '${email}'
  `,
    (err, res) => {
      // Sql error
      if (err) {
        console.log("Error login ", err);
        result({ error: true, message: err }, null);
      } else {
        // Email not found
        if (res.length != 1) {
          let error = {
            error: true,
            message: "Invalid email or password"
          };
          result(error, null);
        } else {
          let valid = bcrypt.compareSync(password, res[0]["password"]);
          // Password valid
          if (valid == true) {
            let payload = {
              user_id: res[0]["user_id"],
              email: res[0]["email"],
              username: res[0]["username"],
              profile_image_url: res[0]["profile_image_url"]
            };
            let token = jwt.sign(payload, key, {
              algorithm: "HS256",
              expiresIn: "15d"
            });
            let msg = {
              error: false,
              login: true,
              token: token
            };
		console.log("Logged in");
            console.log(payload);
            console.log(token);
            result(null, msg);
          }
          // Password invalid
          else {
            let error = {
              error: true,
              message: "Invalid email or password"
            };
            console.log(res);
            result(error, null);
          }
        }
      }
    }
  );
};

// Get all users
User.getAllUsers = function(my_user_id, result) {
  conn.query(
    `
    SELECT    users.user_id,
              users.email,
              users.username,
              users.profile_image_url,
              CASE
                        WHEN followers.follower_id IS NULL THEN false
                        ELSE true
              END AS is_following
    FROM      users
    LEFT JOIN
              (
                    SELECT *
                    FROM   followers
                    WHERE  followers.follower_id = ${my_user_id}) followers 
    ON        users.user_id = followers.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error getting users: ", err);
        result(err, null);
      } else {
        console.log("Fetched all users");
        result(null, res);
      }
    }
  );
};

// Search all users
User.searchAllUsers = function(my_user_id, searchString, result) {
  console.log("model");
  conn.query(
    `
    SELECT    users.user_id,
              users.email,
              users.username,
              users.profile_image_url,
              CASE
                        WHEN followers.follower_id IS NULL THEN false
                        ELSE true
              END AS is_following
    FROM      users
    LEFT JOIN
              (
                    SELECT *
                    FROM   followers
                    WHERE  followers.follower_id = ${my_user_id}) followers 
    ON        users.user_id = followers.user_id
    WHERE     MATCH(users.username, users.about) AGAINST ('${searchString}' IN NATURAL LANGUAGE MODE) AND users.user_id <> ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("No users found ", err);
        result(err, null);
      } else {
        console.log("Fetched all users");
        result(null, res);
      }
    }
  );
};

// Get user profile
User.getUserProfile = function(my_user_id, result) {
  conn.query(
    `
    SELECT    user_tbl.username,
              user_tbl.user_id,
              user_tbl.email,
              user_tbl.about,
              user_tbl.profile_image_url,
              Ifnull(user_followers.followers, 0) AS followercount,
              Ifnull(user_following.following, 0) AS followingcount
    FROM      users user_tbl
    LEFT JOIN
              (
                      SELECT   followers.user_id,
                                Count(DISTINCT followers.follower_id) AS followers
                      FROM     followers
                      GROUP BY followers.user_id ) AS user_followers
    ON        user_tbl.user_id = user_followers.user_id
    LEFT JOIN
              (
                      SELECT   followers.follower_id,
                                Count(followers.user_id) AS following
                      FROM     followers
                      GROUP BY followers.follower_id ) AS user_following
    ON        user_tbl.user_id = user_following.follower_id
    WHERE     user_tbl.user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error getting user: ", err);
        result(err, null);
      } else {
        console.log("Fetched user");
        result(null, res);
      }
    }
  );
};

User.changePassword = function(my_user_id, old_password, new_password, result) {
  conn.query(
    `
    SELECT password
    FROM users 
    WHERE user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log(err);
        result({ error: true, message: err }, null);
      } else if (res.length == 0) {
        console.log("User not found");
        result({ error: true, message: "Invalid user" }, null);
      } else if (bcrypt.compareSync(old_password, res[0]["password"])) {
        let passwordHash = bcrypt.hashSync(new_password, saltRounds);
        conn.query(
          `
          UPDATE users SET password = '${passwordHash}'
          WHERE user_id = ${my_user_id}
          `,
          (err, res) => {
            if (err) {
              result({ error: true, message: err }, null);
            } else {
              let msg = {
                error: false,
                message: "Successfully changed password"
              };
              result(null, msg);
            }
          }
        );
      } else {
        let error = {
          error: true,
          message: "Invalid password"
        };
        result(error, null);
      }
    }
  );
};

// Get user by ID
User.findUserById = function(my_user_id, user_id, result) {
  conn.query(
    `
    SELECT    user_tbl.username,
              user_tbl.user_id,
              user_tbl.email,
              user_tbl.about,
              user_tbl.profile_image_url,
              Ifnull(user_followers.followers, 0) AS followercount,
              Ifnull(user_following.following, 0) AS followingcount,
              CASE
                        WHEN followers.follower_id IS NULL THEN false
                        ELSE true
              END AS is_following
    FROM      users user_tbl
    LEFT JOIN
              (
                      SELECT   followers.user_id,
                                Count(DISTINCT followers.follower_id) AS followers
                      FROM     followers
                      GROUP BY followers.user_id ) AS user_followers
    ON        user_tbl.user_id = user_followers.user_id
    LEFT JOIN
              (
                      SELECT   followers.follower_id,
                                Count(followers.user_id) AS following
                      FROM     followers
                      GROUP BY followers.follower_id ) AS user_following
    ON        user_tbl.user_id = user_following.follower_id
    LEFT JOIN
              (
                SELECT *
                    FROM   followers
                    WHERE  followers.follower_id = ${my_user_id}) followers 
    ON        user_tbl.user_id = followers.user_id
    WHERE     user_tbl.user_id = ${user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error getting user: ", err);
        result(err, null);
      } else {
        console.log("Fetched user");
        result(null, res);
      }
    }
  );
};

// Patch user
User.patchUser = function(my_user_id, user, result) {
  conn.query(
    `
    UPDATE users
    SET    username = '${user.username}', 
          about = '${user.about}', 
          profile_image_url = '${user.profile_image_url}' 
    WHERE  user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error while updating: ", err);
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("User not found", null);
        } else {
          console.log("Successfully updated user");
          let response = "Successfully updated user";
          result(null, response);
        }
      }
    }
  );
};

// Delete user
User.deleteUser = function(my_user_id, result) {
  conn.query(
    `
      DELETE FROM users 
      WHERE  user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error deleting user: ", err);
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("User not found", null);
        } else {
          console.log("Successfully deleted user");
          let response = "Successfully deleted user";
          result(null, response);
        }
      }
    }
  );
};

// Get followers
User.getFollowers = function(my_user_id, result) {
  conn.query(
    `
    SELECT    follower_tbl.user_id,
              follower_tbl.username,
              follower_tbl.email,
              follower_tbl.profile_image_url,
               CASE
                        WHEN followers.follower_id IS NULL THEN false
                        ELSE true
              END AS is_following
    FROM       users user_tbl
    INNER JOIN followers user_follower_tbl
    ON         user_tbl.user_id = user_follower_tbl.user_id
    INNER JOIN users follower_tbl
    ON         user_follower_tbl.follower_id = follower_tbl.user_id
    LEFT JOIN
              (
                SELECT *
                    FROM   followers
                    WHERE  followers.follower_id = ${my_user_id}) followers 
    ON        user_tbl.user_id = followers.user_id
    WHERE      user_tbl.user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching followers: ", err);
        result(err, null);
      } else {
        console.log("Followers: ");
        console.log(res);
        result(null, res);
      }
    }
  );
};

// Get following
User.getFollowing = function(my_user_id, result) {
  conn.query(
    `
    SELECT    following_tbl.user_id,
              following_tbl.username,
              following_tbl.email,
              following_tbl.profile_image_url,
              true as is_following
    FROM       users user_tbl
    INNER JOIN followers user_follower_tbl
    ON         user_tbl.user_id = user_follower_tbl.follower_id
    INNER JOIN users following_tbl
    ON         user_follower_tbl.user_id = following_tbl.user_id
    WHERE      user_tbl.user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching following users: ", err);
        result(err, null);
      } else {
        console.log("Following: ");
        console.log(res);
        result(null, res);
      }
    }
  );
};

// Get user's collections
// owned or authored
User.getUserCollections = function(my_user_id, result) {
  conn.query(
    `
    SELECT    collections.collection_id,
              collections.user_id,
              collections.collection_name,
              collections.image_url,
              collections.description,
              true AS is_owner,
              true AS is_author
    FROM      collections
    WHERE collections.user_id = ${my_user_id}
    UNION
    SELECT    collections.collection_id,
              collections.user_id,
              collections.collection_name,
              collections.image_url,
              collections.description,
              false AS is_owner,
              true AS is_author
    FROM collections
    INNER JOIN (
      SELECT * FROM collection_authors WHERE author_id = '${my_user_id}'
    ) authors
    ON collections.collection_id = authors.collection_id

    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching user's collections: ", err);
        result(err, null);
      } else {
        console.log("User's collections: ");
        console.log(res);
        result(null, res);
      }
    }
  );
};

// Get user's authored articles
User.getUserAuthoredArticles = function(my_user_id, result) {
  conn.query(
    `
    SELECT    articles.article_id,
              articles.user_id,
              articles.collection_id,
              articles.title,
              articles.date_created,
              articles.image_path,
              users.username          AS author,
              users.profile_image_url AS profile_image_url,
              CASE
                        WHEN ab.user_id IS NULL THEN false
                        ELSE true
              END AS is_bookmarked
    FROM      articles
    LEFT JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id, 
              users 
    WHERE     articles.user_id = ${my_user_id} 
    AND       articles.user_id = users.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching user's articles: ", err);
        result(err, null);
      } else {
        console.log("User's articles: ");
        console.log(res);
        result(null, res);
      }
    }
  );
};

// Get user's feed
// Articles from following collections + articles authored by following users
User.getUserFeed = function(my_user_id, result) {
  conn.query(
    `
    SELECT     articles.article_id,
              articles.user_id,
              articles.collection_id,
              articles.title,
              articles.date_created,
              articles.image_path,
              users.username          AS author,
              users.profile_image_url AS profile_image_url,
              CASE
                          WHEN ab.user_id IS NULL THEN false
                          ELSE true
              END AS is_bookmarked
    FROM       articles
    LEFT JOIN
              (
                      SELECT *
                      FROM   article_bookmarks
                      WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON         articles.article_id = ab.article_id 
    INNER JOIN 
              ( 
                      SELECT collection_id 
                      FROM   collection_followers 
                      WHERE  collection_followers.user_id = ${my_user_id}) followers 
    ON         articles.collection_id = followers.collection_id, 
              users 
    WHERE      articles.user_id = users.user_id 
    UNION 
    SELECT     articles.article_id, 
              articles.user_id, 
              articles.collection_id, 
              articles.title, 
              articles.date_created, 
              articles.image_path, 
              users.username          AS author, 
              users.profile_image_url AS profile_image_url, 
              CASE 
                          WHEN ab.user_id IS NULL THEN false 
                          ELSE true 
              END AS is_bookmarked 
    FROM       articles 
    LEFT JOIN 
              ( 
                      SELECT * 
                      FROM   article_bookmarks 
                      WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON         articles.article_id = ab.article_id 
    INNER JOIN 
              ( 
                      SELECT user_id 
                      FROM   followers 
                      WHERE  followers.follower_id = ${my_user_id}) followers 
    ON         articles.user_id = followers.user_id, 
              users 
WHERE      articles.user_id = users.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching collection articles: ", err);
        result(err, null);
      } else {
        console.log("Collection articles fetched ");
        result(null, res);
      }
    }
  );
};

// Get user suggestions
User.getUserSuggestions = function(my_user_id, searchPrompt, result) {
  conn.query(
    `
    SELECT    user_id,
              username,
              email,
              profile_image_url
    FROM      users
    WHERE     username like '${searchPrompt}%' AND user_id <> ${my_user_id}
    LIMIT     5    
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching suggestions: ", err);
        result(err, null);
      } else {
        console.log("Suggestions fetched ");
        result(null, res);
      }
    }
  );
};

module.exports = User;
