let opinionController = require("../controllers/opinion.controller");
let auth = require("../middleware/auth");

let routes = app => {
    app
        .route("/api/v1/article/:articleid/opinions")
        .get(auth, opinionController.getAllOpinions)
        .post(auth, opinionController.insertOpinion);

    app
        .route("/api/v1/article/:articleid/opinions/:opinionId")
        .get(auth, opinionController.getAllReplies)
        .delete(auth, opinionController.deleteOpinion);

};

module.exports = routes;