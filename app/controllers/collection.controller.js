let Collection = require("../models/collection.model");
let CollectionFollower = require("../models/collectionFollower.model");
let CollectionAuthor = require("../models/collectionAuthor.model");

exports.getAllCollections = (req, res) => {
  if (req.query.q) {
    Collection.searchAllCollections(
      req.userId,
      req.query.q,
      (err, collections) => {
        if (err) res.status(500).json({ error: true, message: err });
        else res.status(200).json({ error: false, collections: collections });
      }
    );
  } else {
    Collection.getAllCollections(req.userId, (err, collections) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, collections: collections });
    });
  }
};

exports.findCollectionById = (req, res) => {
  let collectionQuery = new Promise((resolve, reject) => {
    Collection.findCollectionById(
      req.userId,
      req.params.collectionId,
      (err, collection) => {
        if (err) reject(err);
        else resolve(collection);
      }
    );
  });

  let authorQuery = new Promise((resolve, reject) => {
    Collection.getCollectionAuthors(
      req.userId,
      req.params.collectionId,
      (err, authors) => {
        if (err) reject(err);
        else resolve(authors);
      }
    );
  });

  Promise.all([collectionQuery, authorQuery])
    .then(results => {
      if (results[0].length == 0) {
        res.status(404).json({
          error: true,
          message: "Collection not found"
        });
      } else {
        res.status(200).json({
          error: false,
          collection: results[0][0],
          authors: results[1]
        });
      }
    })
    .catch(err => {
      res.status(500).json({ error: true, message: err });
    });
};

exports.insertCollection = (req, res) => {
  if (
    !req.body.collection_id ||
    !req.body.collection_name ||
    !req.body.description ||
    !req.body.image_url
  ) {
    res.status(400).json({ error: true, message: "Required fields are empty" });
  } else {
    let newCollection = new Collection(req.body);
    newCollection.user_id = req.userId;
    if (req.image_path) {
      newCollection.image_url = req.image_path;
    } else {
      newCollection.image_url = "";
    }
    Collection.insertCollection(newCollection, (err, msg) => {
      if (err) res.status(409).json(err);
      else res.status(200).json(msg);
    });
  }
};

exports.updateCollection = (req, res) => {
  if (!req.body.description || !req.body.image_url) {
    res.status(400).json({ error: true, message: "Required fields are empty" });
  } else {
    let collection = new Collection(req.body);
    if (req.image_path) {
      collection.image_url = req.image_path;
    }
    Collection.patchCollection(
      req.userId,
      req.params.collectionId,
      collection,
      (err, msg) => {
        if (err) {
          if (err == "Collection not found")
            res.status(404).json({ error: true, message: err });
          else res.status(500).json({ error: true, message: err });
        } else res.status(200).json({ error: false, message: msg });
      }
    );
  }
};

exports.deleteCollection = (req, res) => {
  Collection.deleteCollection(
    req.userId,
    req.params.collectionId,
    (err, msg) => {
      if (err) {
        if (err == "Collection not found") {
          res.status(404).json({ error: true, message: err });
        } else {
          res.status(500).json({ error: true, message: err });
        }
      } else res.status(200).json({ error: false, message: msg });
    }
  );
};

exports.getCollectionArticles = (req, res) => {
  Collection.getArticles(
    req.userId,
    req.params.collectionId,
    (err, articles) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, articles: articles });
    }
  );
};

// Get followers of a collection
exports.getFollowers = (req, res) => {
  CollectionFollower.getFollowers(req.params.collectionId, (err, followers) => {
    if (err) res.staus(500).json(err);
    else res.status(200).json(followers);
  });
};

// Insert a collection follower
exports.insertFollower = (req, res) => {
  let data = {
    collection_id: req.params.collectionId,
    user_id: req.userId
  };
  let newCollectionFollower = new CollectionFollower(data);
  CollectionFollower.insertFollower(newCollectionFollower, (err, msg) => {
    if (err) res.status(409).json(err);
    else res.status(200).json(msg);
  });
};

// Delete a collection follower
exports.deleteFollower = (req, res) => {
  CollectionFollower.deleteFollower(
    req.params.collectionId,
    req.userId,
    (err, msg) => {
      if (err) {
        if (err == "Follower not found")
          res.status(404).json({ error: true, message: err });
        else res.status(500).json({ error: true, message: err });
      } else res.status(200).json({ error: false, message: msg });
    }
  );
};

// Add multiple authors
exports.addMultipleAuthors = (req, res) => {
  if (!req.body.authors) {
    res.status(400).json({ error: true, message: "Authors not specified" });
  } else {
    let data = [];
    for (author_id of req.body.authors) {
      data.push([req.params.collectionId, author_id]);
    }
    CollectionAuthor.insertMultipleAuthors(data, (err, msg) => {
      if (err) res.status(409).json(err);
      else res.status(200).json(msg);
    });
  }
};

// Delete multiple author
exports.deleteMultipleAuthors = (req, res) => {
  if (!req.body.authors) {
    res.status(400).json({ error: "Authors not specified" });
  }
  let authors = req.body.authors.join(",");
  authors = "(" + authors + ")";
  console.log(authors);
  CollectionAuthor.deleteMultipleAuthors(
    req.params.collectionId,
    authors,
    (err, msg) => {
      if (err) res.status(500).json(err);
      else res.status(200).json(msg);
    }
  );
};

// Add author
exports.addAuthor = (req, res) => {
  let data = {
    collection_id: req.params.collectionId,
    author_id: req.params.authorId
  };
  let newCollectionAuthor = new CollectionAuthor(data);
  CollectionAuthor.insertAuthor(newCollectionAuthor, (err, msg) => {
    if (err) res.json(err);
    else res.json(msg);
  });
};

// Delete author
exports.deleteAuthor = (req, res) => {
  CollectionAuthor.deleteAuthor(
    req.params.collectionId,
    req.params.authorId,
    (err, msg) => {
      if (err) res.json(err);
      else res.json(msg);
    }
  );
};
