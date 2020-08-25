let followerController = require("../controllers/follower.controller");
let auth = require("../middleware/auth");

let routes = app => {
  app.route("/api/v1/followers").get(followerController.getAllFollowers); // To be removed

  // userId -> Id of user to be followed
  // followerId -> Id of the follower, obtained from auth token
  app
    .route("/api/v1/followers/:userId")
    .post(auth, followerController.insertFollower)
    .delete(auth, followerController.deleteFollower);
};

module.exports = routes;
