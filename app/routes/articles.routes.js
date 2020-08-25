let articleController = require("../controllers/article.controller");
let auth = require("../middleware/auth");
let upload = require("../middleware/uploads");

let routes = app => {
  app
    .route("/api/v1/articles")
    .get(auth, articleController.getAllArticles)
    .post(auth, upload.single("image"), articleController.insertArticle);

  app
    .route("/api/v1/articles/:articleId")
    .get(auth, articleController.findArticleById)
    .patch(auth, upload.single("image"), articleController.updateArticle)
    .delete(auth, articleController.deleteArticle);

  app
    .route("/api/v1/articles/:articleId/kudos")
    .patch(auth, articleController.updateKudos);

  app.route("/api/v1/articles/:articleId/commments").get();
};

module.exports = routes;
