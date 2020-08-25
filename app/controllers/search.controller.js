let userModel = require("../models/user.model");
let collectionModel = require("../models/collection.model");
let articleModel = require("../models/article.model");

exports.searchAll = (req, res) => {
  if (!req.query.q) {
    res.status(404).json([]);
  } else {
    let searchString = req.query.q;
    let collectionSearch = new Promise((resolve, reject) => {
      collectionModel.searchAllCollections(
        req.userId,
        searchString,
        (err, collections) => {
          if (err) {
            reject(err);
          } else {
            resolve(collections);
          }
        }
      );
    });

    let articleSearch = new Promise((resolve, reject) => {
      articleModel.searchAllArticles(
        req.userId,
        searchString,
        (err, articles) => {
          if (err) {
            reject(err);
          } else {
            resolve(articles);
          }
        }
      );
    });

    let userSearch = new Promise((resolve, reject) => {
      userModel.searchAllUsers(req.userId, searchString, (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });

    Promise.all([collectionSearch, articleSearch, userSearch])
      .then(results => {
        res.status(200).json({
          collections: results[0],
          articles: results[1],
          users: results[2]
        });
      })
      .catch(err => {
        res.status(409).send(err);
      });
  }
};
