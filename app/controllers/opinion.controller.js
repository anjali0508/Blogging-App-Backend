let Opinion = require("../models/opinion.model");

exports.getAllOpinions = (req, res) => {
  //console.log(req.body);
  console.log(req.params.articleid);
  Opinion.getAllOpinions(
    req.params.articleid,
    (err, opinions) => {
      if (err) res.json(err);
      else res.json(opinions);
    }
  );
};

exports.insertOpinion = (req, res) => {
  if (!req.body.content || !req.body.date_created || !req.body.is_reply) {
    res.status(400).json({ error: true, message :  "Content body is empty" });
  }else{
    console.log(req.body);
    console.log(req.params.articleid)

    //Add authorization for user id, now it is coming from body
    let newOpinion = new Opinion(req.body);
    console.log(req.userId);
    newOpinion["article_id"] = req.params.articleid;
    newOpinion["user_id"] = req.userId;
    Opinion.insertOpinion(newOpinion, (err, msg) => {
      if (err) res.status(409).json(err);
      else res.status(200).json(msg);
    });
  }
};

exports.getAllReplies = (req, res) => {
  console.log(req.body.params);
  Opinion.getAllReplies(
    req.params.opinionId,
    req.params.articleid,
    (err, replies) => {
      if (err) res.json(err);
      else res.json(replies);
    }
  );
};

exports.deleteOpinion = (req, res) => {
  Article.deleteOpinion(req.params.opinionId,req.params.articleId, (err, msg) => {
    if (err) {
      if (err == "Opinion not found") {
        res.status(404).json({ error: true, message: err });
      } else {
        res.status(500).json({ error: true, message: err });
      }
    } else res.status(200).json({ error: false, message: msg });
  });
};