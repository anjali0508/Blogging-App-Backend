let jwt = require("jsonwebtoken");
let config = require("../config");

const key = config.key;

let auth = async (req, res, next) => {
  let token = req.header("Authorization");
  try {
    let data = jwt.verify(token, key, { algorithm: "HS256" });
    req.userId = data.user_id;
    req.token = token;
    next();
  } catch (err) {
    res.status(401);
    res.json({ error: true, message: "Token invalid" });
  }
};

module.exports = auth;
