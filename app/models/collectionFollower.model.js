let conn = require("./connection");

let CollectionFollower = function(collectionFollower) {
  this.user_id = collectionFollower.user_id;
  this.collection_id = collectionFollower.collection_id;
};

// Get all data in collection followers table
CollectionFollower.getAll = function(result) {
  conn.query(`SELECT * FROM collection_followers`, (err, res) => {
    if (err) {
      console.log("Error fetching followers: ", err);
      result(err, null);
    } else {
      console.log("Fetched all followers");
      result(null, res);
    }
  });
};

// Get all followers
// Just send count
CollectionFollower.getFollowers = function(collection_id, result) {
  conn.query(
    `SELECT * FROM collection_followers WHERE collection_id = '${collection_id}'`,
    (err, res) => {
      if (err) {
        console.log("Error fetching followers: ", err);
        result(err, null);
      } else {
        console.log("Fetched all followers");
        result(null, res);
      }
    }
  );
};

// Add follower
CollectionFollower.insertFollower = function(newCollectionFollower, result) {
  conn.query(
    `INSERT INTO collection_followers SET ? `,
    newCollectionFollower,
    (err, res) => {
      if (err) {
        console.log("Error inserting follower: ", err);
        let error = { error: true, message: err };
        if (err.code == "ER_NO_REFERENCED_ROW_2") {
          error = {
            error: true,
            message:
              "Invalid user ID or collection ID. Foreign key constraint fails"
          };
        } else if (err.code == "ER_DUP_ENTRY") {
          error = {
            error: true,
            message: "Follower exists"
          };
        }
        result(error, null);
      } else {
        let responseMessage = {
          error: false,
          message: "Successfully inserted follower"
        };
        console.log("Successfully inserted follower");
        result(null, responseMessage);
      }
    }
  );
};

// Delete follower
CollectionFollower.deleteFollower = function(collection_id, user_id, result) {
  conn.query(
    `DELETE FROM collection_followers WHERE user_id = ${user_id} AND collection_id = '${collection_id}'`,
    (err, res) => {
      if (err) {
        console.log("Error deleting follower: ", err);
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("Follower not found", null);
        } else {
          console.log("Deleted follower");
          let response = "Successfully removed follower";
          result(null, response);
        }
      }
    }
  );
};

// get following collections
// to be shown in profile page
CollectionFollower.getCollections = function(my_user_id, result) {
  conn.query(
    `
      SELECT    *,
                collections.collection_id,
                collections.user_id,
                CASE
                          WHEN ca.author_id IS NULL THEN false
                          ELSE true
                END AS is_author,
                CASE
                          WHEN collections.user_id = ${my_user_id} THEN true
                          ELSE false 
                END AS is_owner, 
                CASE 
                          WHEN followers.user_id IS NULL THEN false
                          ELSE true 
                END AS is_following 
      FROM      collections
      LEFT JOIN 
                ( 
                      SELECT * 
                      FROM   collection_authors 
                      WHERE  collection_authors.author_id = ${my_user_id}) ca 
      ON        collections.collection_id = ca.collection_id 
      INNER JOIN 
                ( 
                      SELECT * 
                      FROM   collection_followers 
                      WHERE  collection_followers.user_id = ${my_user_id}) followers 
      ON        collections.collection_id = followers.collection_id 
      `,
    (err, res) => {
      if (err) {
        console.log("Error fetching collections: ", err);
        result(err, null);
      } else {
        console.log("Successfully fetched collections");

        result(null, res);
      }
    }
  );
};

// Fetch articles in followed collections
// yo be shown in home page
CollectionFollower.getArticles = function(my_user_id, result) {
  conn.query(
    `
    SELECT    articles.article_id,
              articles.user_id,
              articles.collection_id,
              articles.title,
              articles.date_created,
              articles.image_path,
              case
                        when ab.user_id IS NULL THEN false
                        ELSE true
              END AS is_bookmarked
    FROM      articles
    LEFT JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id
    INNER JOIN
              (
                    SELECT collection_id
                    FROM   collection_followers
                    WHERE  collection_followers.user_id = ${my_user_id}) followers 
    ON        articles.collection_id = followers.collection_id 
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
module.exports = CollectionFollower;
