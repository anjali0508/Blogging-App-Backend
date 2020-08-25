let conn = require("./connection");

let ArticleBookmark = function(articleBookmark) {
  this.user_id = articleBookmark.user_id;
  this.article_id = articleBookmark.article_id;
};

ArticleBookmark.getAllData = function(result) {
  conn.query(`SELECT * FROM article_bookmarks`, (err, res) => {
    if (err) {
      console.log("Error fetching bookmarks: ", err);
      result(err, null);
    } else {
      console.log("Bookmarks: ", res);
      result(null, res);
    }
  });
};

ArticleBookmark.getUserBookmarks = function(my_user_id, result) {
  conn.query(
    `
    SELECT    articles.article_id,
              articles.user_id,
              articles.collection_id,
              articles.title,
              articles.date_created,
              articles.image_path,
              users.username as author,
              users.profile_image_url as profile_image_url,
              case
                        when ab.user_id IS NULL THEN false
                        ELSE true
              END AS is_bookmarked
    FROM      articles
    INNER JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id,
              users
    WHERE     users.user_id = articles.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error fetching bookmark");
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

ArticleBookmark.addUserBookmark = function(newBookmark, result) {
  conn.query(
    `
    INSERT INTO article_bookmarks 
    SET ?
    `,
    newBookmark,
    (err, res) => {
      if (err) {
        let error = { error: true, message: err };
        if (err.code == "ER_NO_REFERENCED_ROW_2") {
          error = {
            error: true,
            message: "Foreign key constraint fails"
          };
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          error = {
            error: true,
            message: "Required fields are empty"
          };
        } else if (err.code == "ER_DUP_ENTRY") {
          error = {
            error: true,
            message: "Bookmark exists"
          };
        }
        result(error, null);
      } else {
        let responseMessage = {
          error: false,
          message: "Successfully added bookmark"
        };
        console.log("Successfully added bookmark");
        result(null, responseMessage);
      }
    }
  );
};

ArticleBookmark.deleteUserBookmark = function(my_user_id, article_id, result) {
  conn.query(
    `
    DELETE FROM article_bookmarks 
    WHERE article_id = ${article_id} AND user_id = ${my_user_id}
    `,
    (err, res) => {
      if (err) {
        console.log("Error deleting bookmark");
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("Bookmark not found", null);
        } else {
          console.log("Deleted bookmark");
          let response = "Successfully removed bookmark";
          result(null, response);
        }
      }
    }
  );
};

module.exports = ArticleBookmark;
