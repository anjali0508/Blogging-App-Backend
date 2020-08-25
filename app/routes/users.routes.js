let auth = require("../middleware/auth");
let upload = require("../middleware/uploads");
let userController = require("../controllers/user.controller");

let routes = app => {
  app.route("/api/v1/users").get(auth, userController.getAllUsers);
  // .post(userController.insertUser); SIgnup

  app
    .route("/api/v1/user")
    .get(auth, userController.getUserProfile)
    .patch(auth, upload.single("image"), userController.updateUser)
    .delete(auth, userController.deleteUser);

  // Change password
  app.route("/api/v1/user/password").patch(auth, userController.changePassword);

  // Get other users
  app.route("/api/v1/users/:userId").get(auth, userController.findUserById);

  // user feed
  app.route("/api/v1/user/feed").get(auth, userController.getUserFeed);

  // Following collections
  app
    .route("/api/v1/user/following/collections")
    .get(auth, userController.getFollowingCollections);

  app
    .route("/api/v1/user/following/collections/articles")
    .get(auth, userController.getFollowingCollectionArticles);

  // User owned or authored collections
  app
    .route("/api/v1/user/:userId/collections")
    .get(auth, userController.getUserCollections);

  app
    .route("/api/v1/user/:userId/articles")
    .get(auth, userController.getUserAuthoredArticles);

  //   Followers and following
  app
    .route("/api/v1/user/followers")
    .get(auth, userController.getUserFollowers);

  app
    .route("/api/v1/user/following")
    .get(auth, userController.getUserFollowing);

  // Article Bookmarks
  // All bookmarks. Delete later
  app.route("/api/v1/bookmarks").get(userController.geAllBookmarkedArticles);

  app
    .route("/api/v1/user/bookmarks")
    .get(auth, userController.getBookmarkedArticles);

  app
    .route("/api/v1/user/bookmarks/:articleId")
    .post(auth, userController.addUserBookmark)
    .delete(auth, userController.removeUserBookmark);
};

module.exports = routes;
