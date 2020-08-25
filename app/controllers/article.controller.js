let Article = require("../models/article.model");

exports.getAllArticles = (req, res) => {
  if (req.query.q) {
    Article.searchAllArticles(req.userId, req.query.q, (err, articles) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, articles: articles });
    });
  } else {
    Article.getAllArticles(req.userId, (err, articles) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, articles: articles });
    });
  }
};

exports.findArticleById = (req, res) => {
  Article.findArticleById(req.userId, req.params.articleId, (err, article) => {
    if (err) res.status(500).json({ error: true, message: err });
    else {
      if (article.length == 0) {
        res.status(404).json({ error: true, message: "Article not found" });
      } else {
        res.status(200).json({ error: false, article: article[0] });
      }
    }
  });
};

exports.insertArticle = (req, res) => {
  if (
    !req.body.article_id ||
    !req.body.collection_id ||
    !req.body.title ||
    !req.body.content ||
    !req.body.image_path ||
    !req.body.date_created
  ) {
    res.status(400).json({ error: true, message: "Required fields are empty" });
  } else {
    let newArticle = new Article(req.body);
    newArticle.user_id = req.userId;
    if (req.image_path) {
      newArticle.image_path = req.image_path;
    } else {
      newArticle.image_path = "";
    }
    Article.insertArticle(newArticle, (err, msg) => {
      if (err) res.status(409).json(err);
      else res.status(200).json(msg);
    });
  }
};

exports.updateArticle = (req, res) => {
  if (!req.body.title || !req.body.content || !req.body.image_path) {
    res.status(400).json({ error: true, message: "Required fields empty" });
  } else {
    let article = new Article(req.body);
    if (req.image_path) {
      article.image_path = req.image_path;
    }
    Article.patchArticle(
      req.userId,
      req.params.articleId,
      article,
      (err, msg) => {
        if (err) {
          if (err == "Article not found") {
            res.status(404).json({ error: true, message: err });
          } else {
            res.status(500).json({ error: true, message: err });
          }
        } else res.status(200).json({ error: false, message: msg });
      }
    );
  }
};

exports.deleteArticle = (req, res) => {
  Article.deleteArticle(req.userId, req.params.articleId, (err, msg) => {
    if (err) {
      if (err == "Article not found") {
        res.status(404).json({ error: true, message: err });
      } else {
        res.status(500).json({ error: true, message: err });
      }
    } else res.status(200).json({ error: false, message: msg });
  });
};

exports.updateKudos = (req, res) => {
  if (!req.body) {
    res.status(400).json({ error: "Request body empty" });
  }
  Article.updateKudos(req.params.articleId, req.body.kudos, (err, msg) => {
    if (err) res.json(err);
    else res.json(msg);
  });
};
