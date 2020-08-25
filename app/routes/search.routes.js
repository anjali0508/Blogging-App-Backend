let searchController = require("../controllers/search.controller");
let auth = require("../middleware/auth");

let routes = app => {
  app.route("/api/v1/search").get(auth, searchController.searchAll);
};

module.exports = routes;
