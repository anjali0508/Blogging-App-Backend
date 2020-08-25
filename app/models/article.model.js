const conn = require("./connection");

const Article = function(article) {
  this.article_id = article.article_id;
  this.collection_id = article.collection_id;
  this.user_id = article.user_id;
  this.title = article.title;
  this.content = article.content;
  this.published = article.published;
  this.image_path = article.image_path;
  this.views_count = article.views_count;
  this.kudos_count = article.kudos_count;
  this.date_created = article.date_created;
  this.date_updated = article.date_updated;
  this.tags = article.tags;
};

// Insert Article
Article.insertArticle = function(newArticle, result) {
  console.log("newwwwwwwwwwwwwwwwwwwwwwww");
  console.log(newArticle.content);
  conn.query(
    `
    INSERT INTO articles 
    SET ?
    `,
    newArticle,
    (err, res) => {
      if (err) {
        let error = {
          error: true,
          message: err
        };
        console.log("Error inserting article: ");
        if (err.code == "ER_DUP_ENTRY") {
          error = {
            error: true,
            message: "Article ID exists"
          };
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          error = {
            error: true,
            message: "Required fields are empty"
          };
        } else if (err.code == "ER_NO_REFERENCED_ROW_2") {
          error = {
            error: true,
            message:
              "Invalid user ID or collection ID. Foreign key constraint fails"
          };
        }
        result(error, null);
      } else {
        let responseMessage = {
          error: false,
          message: "Successfully inserted article"
        };
        console.log("Successfully inserted article: ", newArticle.title);
        result(null, responseMessage);
      }
    }
  );
};

// Get all articles
Article.getAllArticles = function(my_user_id, result) {
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
    LEFT JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id ,
              users
    WHERE     articles.user_id = users.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error getting articles: ", err);
        result(err, null);
      } else {
        console.log("Fetched all articles");
        result(null, res);
      }
    }
  );
};

// Search all articles
Article.searchAllArticles = function(my_user_id, searchString, result) {
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
    FROM      users, articles
    LEFT JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id
    WHERE MATCH(title,tags) AGAINST ('${searchString}' IN NATURAL LANGUAGE MODE)
    AND   articles.user_id = users.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("No articles found", err);
        result(err, null);
      } else {
        console.log("Fetched all articles");
        result(null, res);
      }
    }
  );
};

// Get article by ID
Article.findArticleById = function(my_user_id, article_id, result) {
  conn.query(
    `
    SELECT    articles.article_id,
              articles.collection_id,
              articles.user_id,
              articles.title,
              articles.content,
              articles.image_path,
              articles.kudos_count,
              articles.date_created,
              articles.date_updated,
              articles.tags,
              users.username as author,
              users.profile_image_url as profile_image_url,
              CASE
                        WHEN ab.user_id IS NULL THEN false
                        ELSE true
              END AS is_bookmarked,
              CASE
                        WHEN articles.user_id = ${my_user_id} THEN true
                        ELSE false
              END AS is_author
    FROM      articles
    LEFT JOIN
              (
                    SELECT *
                    FROM   article_bookmarks
                    WHERE  article_bookmarks.user_id = ${my_user_id}) ab 
    ON        articles.article_id = ab.article_id,
              users
    WHERE articles.article_id = '${article_id}'
    AND   articles.user_id = users.user_id
    `,
    (err, res) => {
      if (err) {
        console.log("Error getting article: ", err);
        result(err, null);
      } else {
        console.log("Fetched article");
        result(null, res);
      }
    }
  );
};

// Patch article
Article.patchArticle = function(my_user_id, article_id, article, result) {
  conn.query(
    `
    UPDATE articles
    SET   title= ?, 
          content= ? , 
          image_path= ?, 
          date_updated= ?,
          tags=?
    WHERE  article_id='${article_id}' and user_id = ${my_user_id}
    `,
    [
      article.title,
      article.content,
      article.image_path,
      article.date_updated,
      article.tags
    ],
    (err, res) => {
      if (err) {
        let error = err;
        console.log("Error while updating: ", err);
        if (
          err.code == "ER_BAD_NULL_ERROR" ||
          err.code == "ER_BAD_FIELD_ERROR"
        ) {
          error = "Required fields are empty";
        }
        result(error, null);
      } else {
        if (res.affectedRows == 0) {
          result("Article not found", null);
        } else {
          console.log("Successfully updated article");
          let response = "Successfully updated article";

          result(null, response);
        }
      }
    }
  );
};

// Delete article
Article.deleteArticle = function(my_user_id, article_id, result) {
  conn.query(
    `
    DELETE FROM articles 
    WHERE  article_id = '${article_id}' AND user_id = ${my_user_id}
    `,
    [article_id],
    (err, res) => {
      if (err) {
        console.log("Error deleting article: ", err);
        result(err, null);
      } else {
        if (res.affectedRows == 0) {
          result("Article not found", null);
        } else {
          console.log("Successfully deleted article");
          let response = "Successfully deleted article";
          result(null, response);
        }
      }
    }
  );
};

// Update kudos
Article.updateKudos = function(article_id, kudos, result) {
  conn.query(
    `
    UPDATE articles
    SET   kudos_count = ${kudos}
    WHERE  article_id='${article_id}'
    `,
    (err, res) => {
      if (err) {
        let error = err;
        console.log("Error while updating: ", err);
        result(error, null);
      } else {
        console.log("Successfully updated kudos");
        let responseMessage = {
          message: "Successfully updated kudos"
        };
        result(null, responseMessage);
      }
    }
  );
};

module.exports = Article;
