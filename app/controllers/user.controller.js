let User = require("../models/user.model");
let CollectionFollower = require("../models/collectionFollower.model");
let ArticleBookmark = require("../models/articleBookmarks.model");

exports.getAllUsers = (req, res) => {
  if (req.query.q) {
    // Search users
    User.searchAllUsers(req.userId, req.query.q, (err, users) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, users: users });
    });
  } else if (req.query.prompt) {
    // Suggest users
    User.getUserSuggestions(req.userId, req.query.prompt, (err, users) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, users: users });
    });
  } else {
    // Get all users
    User.getAllUsers(req.userId, (err, users) => {
      if (err) res.status(500).json({ error: true, message: err });
      else res.status(200).json({ error: false, users: users });
    });
  }
};

exports.getUserProfile = (req, res) => {
  User.getUserProfile(req.userId, (err, user) => {
    if (err) res.status(500).json({ error: true, message: err });
    else if (user.length == 0)
      res.status(404).json({ error: true, message: "User not found" });
    else res.status(200).json({ error: false, user: user[0] });
  });
};

exports.changePassword = (req, res) => {
  if (!req.body.oldPassword || !req.body.newPassword) {
    res.status(400).json({ error: true, message: "Required fields are empty" });
  } else {
    User.changePassword(
      req.userId,
      req.body.oldPassword,
      req.body.newPassword,
      (err, msg) => {
        if (err) res.status(401).json(err);
        else res.status(200).json(msg);
      }
    );
  }
};

exports.findUserById = (req, res) => {
  User.findUserById(req.userId, req.params.userId, (err, user) => {
    if (err) res.status(500).json({ error: true, message: err });
    else {
      if (user.length == 0)
        res.status(500).json({ error: true, message: "User not found" });
      else res.status(200).json({ error: false, user: user[0] });
    }
  });
};

exports.insertUser = (req, res) => {
  if (!req.body.email || !req.body.username || !req.body.password) {
    res
      .status(400)
      .json({ error: true, message: "Required information is incomplete" });
  } else {
    let newUser = new User(req.body);
    User.insertUser(newUser, (err, msg) => {
      if (err) res.status(409).json(err);
      else res.status(200).json(msg);
    });
  }
};

exports.updateUser = (req, res) => {
  if (!req.body.about || !req.body.username || !req.body.profile_image_url) {
    res.status(400).json({ error: true, message: "Required fields empty" });
  } else {
    let data = {
      username: req.body.username,
      about: req.body.about,
      profile_image_url: req.body.profile_image_url
    };
    // if upload successful, update image url
    if (req.image_path) {
      data.profile_image_url = req.image_path;
    }
    console.log(data);
    let user = new User(data);
    User.patchUser(req.userId, user, (err, msg) => {
      if (err) {
        if (err == "User not found")
          res.status(404).json({ error: true, message: err });
        else res.status(500).json({ error: true, message: err });
      } else res.status(200).json({ error: false, message: msg });
    });
  }
};

exports.deleteUser = (req, res) => {
  User.deleteUser(req.userId, (err, msg) => {
    if (err) {
      if (err == "User not found")
        res.status(404).json({ error: true, message: err });
      else res.status(500).json({ error: true, message: err });
    } else res.status(200).json(msg);
  });
};

// Returns list of users' followers
exports.getUserFollowers = (req, res) => {
  User.getFollowers(req.userId, (err, followers) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, followers: followers });
  });
};

// Returns list of users followed by the specified user
exports.getUserFollowing = (req, res) => {
  User.getFollowing(req.userId, (err, following) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, following: following });
  });
};

// Get user owned collections
exports.getUserCollections = (req, res) => {
  User.getUserCollections(req.params.userId, (err, collections) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, collections: collections });
  });
};

// Get user authored articles
exports.getUserAuthoredArticles = (req, res) => {
  User.getUserAuthoredArticles(req.params.userId, (err, articles) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, articles: articles });
  });
};

// Get following collections
exports.getFollowingCollections = (req, res) => {
  CollectionFollower.getCollections(req.userId, (err, collections) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, collections: collections });
  });
};

// Get articles of following collections
exports.getFollowingCollectionArticles = (req, res) => {
  CollectionFollower.getArticles(req.userId, (err, articles) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, articles: articles });
  });
};

// All data of article_bookmarks table
// Delete later
exports.geAllBookmarkedArticles = (req, res) => {
  ArticleBookmark.getAllData((err, data) => {
    if (err) res.json(err);
    else res.json(data);
  });
};

// Get user's bookmarks
exports.getBookmarkedArticles = (req, res) => {
  ArticleBookmark.getUserBookmarks(req.userId, (err, articles) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, articles: articles });
  });
};

// Add bookmark
exports.addUserBookmark = (req, res) => {
  let data = {
    user_id: req.userId,
    article_id: req.params.articleId
  };
  let newBookmark = new ArticleBookmark(data);
  ArticleBookmark.addUserBookmark(newBookmark, (err, msg) => {
    if (err) res.status(409).json(err);
    else res.status(200).json(msg);
  });
};

exports.removeUserBookmark = (req, res) => {
  ArticleBookmark.deleteUserBookmark(
    req.userId,
    req.params.articleId,
    (err, msg) => {
      if (err) {
        if (err == "Bookmark not found")
          res.status(404).json({ error: true, message: err });
        else res.status(500).json({ error: true, message: err });
      } else res.status(200).json({ error: false, message: msg });
    }
  );
};

exports.login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    res
      .status(400)
      .json({ error: true, message: "Required information is incomplete" });
  } else {
    User.login(req.body.email, req.body.password, (err, msg) => {
      if (err) res.status(401).json(err);
      else res.status(200).json(msg);
    });
  }
};

exports.getUserFeed = (req, res) => {
  User.getUserFeed(req.userId, (err, articles) => {
    if (err) res.status(500).json({ error: true, message: err });
    else res.status(200).json({ error: false, articles: articles });
  });
};
