let userController = require("../controllers/user.controller");

let routes = app => {
  app.route("/api/v1/signup").post(userController.insertUser);
  app.route("/api/v1/login").post(userController.login);
  app.route("/api/v1/logout").post();
};

module.exports = routes;
