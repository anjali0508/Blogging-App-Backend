let Follower = require("../models/follower.model");

// Get all data in followers table
exports.getAllFollowers = (req, res) => {
  Follower.getAllFollowers((err, followers) => {
    if (err) res.json(err);
    else res.json(followers);
  });
};

exports.insertFollower = (req, res) => {
  let data = {
    follower_id: req.userId,
    user_id: req.params.userId
  };
  let newFollower = new Follower(data);
  Follower.insertFollower(newFollower, (err, msg) => {
    if (err) res.status(409).json(err);
    else res.status(200).json(msg);
  });
};

exports.deleteFollower = (req, res) => {
  Follower.deleteFollower(req.userId, req.params.userId, (err, msg) => {
    if (err) {
      if (err == "Follower not found")
        res.status(404).json({ error: true, message: err });
      else res.status(500).json({ error: true, message: err });
    } else res.status(200).json({ error: false, message: msg });
  });
};
